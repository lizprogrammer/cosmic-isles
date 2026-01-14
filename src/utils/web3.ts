export const BASE_CHAIN_ID = '0x2105'; // 8453
export const BASE_SEPOLIA_CHAIN_ID = '0x14a34'; // 84532

export interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}

/**
 * Get Farcaster SDK wallet address and provider
 */
let farcasterWalletAddress: string | null = null;

const getFarcasterWallet = async (): Promise<{ address: string; provider: EthereumProvider | null } | null> => {
  if (typeof window === 'undefined') return null;
  
  try {
    const { default: sdk } = await import("@farcaster/miniapp-sdk");
    
    // Get the context which contains wallet info
    const context = await sdk.context;
    console.log('🔍 Farcaster context:', context);
    
    // Check if context has wallet address
    if (context?.wallet?.address) {
      const address = context.wallet.address;
      console.log('✅ Found Farcaster wallet address:', address);
      
      // Check if SDK provides a wallet provider (EIP-1193 compatible)
      // The SDK might expose wallet through sdk.wallet or through context
      let walletProvider: EthereumProvider | null = null;
      
      // Try to find the wallet provider in the SDK
      if ((sdk as any).wallet && typeof (sdk as any).wallet.request === 'function') {
        walletProvider = (sdk as any).wallet as EthereumProvider;
        console.log('✅ Using Farcaster SDK wallet provider');
      } else if ((window as any).farcaster?.wallet) {
        walletProvider = (window as any).farcaster.wallet as EthereumProvider;
        console.log('✅ Using Farcaster wallet from window');
      }
      
      return { address, provider: walletProvider };
    }
    
    console.log('⚠️ Farcaster SDK available but no wallet found in context');
  } catch (error) {
    console.log('⚠️ Farcaster SDK not available:', error);
  }
  
  return null;
};

/**
 * Get wallet provider - tries Farcaster SDK first, then any EIP-1193 provider
 */
export const getProvider = async (): Promise<EthereumProvider | null> => {
  // Try Farcaster SDK first
  const farcasterWallet = await getFarcasterWallet();
  
  if (farcasterWallet?.provider) {
    return farcasterWallet.provider;
  }
  
  if (farcasterWallet?.address) {
    // We have the address but no provider - create a minimal provider wrapper
    console.log('✅ Using Farcaster wallet address, creating provider wrapper');
    return {
      request: async (args: { method: string; params?: any[] }) => {
        if (args.method === 'eth_requestAccounts' || args.method === 'eth_accounts') {
          return [farcasterWallet.address];
        }
        if (args.method === 'eth_chainId') {
          return BASE_CHAIN_ID; // Farcaster uses Base
        }
        // For transactions, we'll need to use Farcaster SDK's transaction methods
        // This will be handled in sendMintTransaction
        throw new Error('Use Farcaster SDK transaction methods directly');
      }
    } as EthereumProvider;
  }
  
  // Fallback to any EIP-1193 provider (but warn user)
  console.warn('⚠️ Farcaster wallet not available, falling back to external wallet');
  return getFallbackProvider();
};

/**
 * Get fallback provider (Coinbase Wallet, MetaMask, or any EIP-1193 provider)
 */
const getFallbackProvider = (): EthereumProvider | null => {
  if (typeof window === 'undefined') return null;
  
  // Try Coinbase Wallet first (common in Farcaster ecosystem)
  if ((window as any).coinbase?.ethereum) {
    console.log('✅ Using Coinbase Wallet');
    return (window as any).coinbase.ethereum;
  }
  
  // Try any EIP-1193 provider
  if ((window as any).ethereum) {
    console.log('✅ Using EIP-1193 provider (MetaMask or other)');
    return (window as any).ethereum;
  }
  
  return null;
};

export const connectWallet = async (): Promise<string | null> => {
  // Try Farcaster SDK first - this is the primary method
  const farcasterWallet = await getFarcasterWallet();
  
  if (farcasterWallet?.address) {
    farcasterWalletAddress = farcasterWallet.address;
    console.log('✅ Connected to Farcaster wallet:', farcasterWallet.address);
    return farcasterWallet.address;
  }
  
  // Fallback to provider-based connection (shouldn't happen in Farcaster)
  console.warn('⚠️ Farcaster wallet not found, trying fallback provider');
  const provider = await getProvider();
  if (!provider) {
    alert("Unable to access Farcaster wallet. Please ensure you're using Warpcast or Farcaster app.");
    return null;
  }

  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    if (accounts && accounts.length > 0) {
      console.log('✅ Wallet connected via fallback provider:', accounts[0]);
      return accounts[0];
    }
    return null;
  } catch (error) {
    console.error("User rejected connection", error);
    return null;
  }
};

export const switchToBase = async (isTestnet = false): Promise<boolean> => {
  const provider = await getProvider();
  if (!provider) {
    console.error('No provider available to switch network');
    return false;
  }

  const chainId = isTestnet ? BASE_SEPOLIA_CHAIN_ID : BASE_CHAIN_ID;
  
  try {
    // Check current chain
    const currentChainId = await provider.request({ method: 'eth_chainId' });
    if (currentChainId === chainId) {
      console.log('✅ Already on Base network');
      return true;
    }
    
    // Try to switch
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
    console.log('✅ Switched to Base network');
    return true;
  } catch (error: any) {
    // This error code indicates that the chain has not been added to the wallet.
    if (error.code === 4902) {
      console.log('Base network not found, adding it...');
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId,
              chainName: isTestnet ? 'Base Sepolia' : 'Base',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [isTestnet ? 'https://sepolia.base.org' : 'https://mainnet.base.org'],
              blockExplorerUrls: [isTestnet ? 'https://sepolia.basescan.org' : 'https://basescan.org'],
            },
          ],
        });
        console.log('✅ Base network added and switched');
        return true;
      } catch (addError) {
        console.error('Failed to add Base network:', addError);
      }
    }
    console.error('Failed to switch to Base network:', error);
    return false;
  }
};

export const sendMintTransaction = async (
  contractAddress: string,
  priceInEth: string,
  fromAddress: string
): Promise<string | null> => {
  // Try Farcaster SDK first for sending transactions
  try {
    const { default: sdk } = await import("@farcaster/miniapp-sdk");
    const context = await sdk.context;
    
    // Check if we have Farcaster wallet
    if (context?.wallet?.address === fromAddress) {
      console.log('📤 Sending transaction via Farcaster SDK...');
      
      // Convert ETH to Wei (hex)
      const valueWei = BigInt(parseFloat(priceInEth) * 1e18).toString(16);
      const data = '0x1249c58b'; // mint() function selector
      
      // Try to use Farcaster SDK's transaction method
      // The SDK might expose this through sdk.wallet or sdk.actions
      if ((sdk as any).wallet && typeof (sdk as any).wallet.request === 'function') {
        const txHash = await (sdk as any).wallet.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: fromAddress,
              to: contractAddress,
              value: '0x' + valueWei,
              data: data,
            },
          ],
        });
        
        console.log('✅ Transaction sent via Farcaster SDK:', txHash);
        return txHash;
      }
      
      // Alternative: Check if SDK has a sendTransaction action
      if ((sdk as any).actions?.sendTransaction) {
        const txHash = await (sdk as any).actions.sendTransaction({
          to: contractAddress,
          value: '0x' + valueWei,
          data: data,
        });
        
        console.log('✅ Transaction sent via Farcaster actions:', txHash);
        return txHash;
      }
    }
  } catch (error) {
    console.log('Farcaster SDK transaction method not available, trying provider...', error);
  }
  
  // Fallback to provider (shouldn't be needed in Farcaster, but keep as backup)
  const provider = await getProvider();
  if (!provider) {
    console.error('No provider available for transaction');
    return null;
  }

  try {
    // Convert ETH to Wei (hex)
    const valueWei = BigInt(parseFloat(priceInEth) * 1e18).toString(16);
    const data = '0x1249c58b'; 

    console.log('📤 Sending mint transaction via provider...', {
      from: fromAddress,
      to: contractAddress,
      value: priceInEth + ' ETH',
      chainId: BASE_CHAIN_ID
    });

    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: fromAddress,
          to: contractAddress,
          value: '0x' + valueWei,
          data: data,
        },
      ],
    });

    console.log('✅ Transaction sent:', txHash);
    return txHash;
  } catch (error) {
    console.error("❌ Mint transaction failed", error);
    return null;
  }
};
