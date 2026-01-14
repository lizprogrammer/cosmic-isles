export const BASE_CHAIN_ID = '0x2105'; // 8453
export const BASE_SEPOLIA_CHAIN_ID = '0x14a34'; // 84532

export interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}

/**
 * Get wallet provider - tries Farcaster SDK first, then any EIP-1193 provider
 */
export const getProvider = async (): Promise<EthereumProvider | null> => {
  if (typeof window === 'undefined') return null;
  
  // Try Farcaster SDK first
  try {
    const { default: sdk } = await import("@farcaster/miniapp-sdk");
    // Check if SDK has wallet context
    const context = await sdk.context;
    if (context?.wallet?.address) {
      // Farcaster provides wallet context
      console.log('✅ Using Farcaster wallet context');
      // Return a provider-like object that uses Farcaster's wallet
      return {
        request: async (args: { method: string; params?: any[] }) => {
          if (args.method === 'eth_requestAccounts') {
            return [context.wallet.address];
          }
          if (args.method === 'eth_accounts') {
            return [context.wallet.address];
          }
          // For other methods, try to use window.ethereum or window.coinbase
          const fallbackProvider = getFallbackProvider();
          if (fallbackProvider) {
            return fallbackProvider.request(args);
          }
          throw new Error('Provider not available');
        }
      } as EthereumProvider;
    }
  } catch (error) {
    console.log('Farcaster SDK wallet not available, trying fallback providers');
  }
  
  // Fallback to any EIP-1193 provider
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
  const provider = await getProvider();
  if (!provider) {
    alert("Please connect a wallet. Coinbase Wallet or other Base-compatible wallets are supported.");
    return null;
  }

  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    if (accounts && accounts.length > 0) {
      console.log('✅ Wallet connected:', accounts[0]);
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
  const provider = await getProvider();
  if (!provider) {
    console.error('No provider available for transaction');
    return null;
  }

  try {
    // Convert ETH to Wei (hex)
    const valueWei = BigInt(parseFloat(priceInEth) * 1e18).toString(16);
    
    // Encoded 'mint()' function call selector
    // Standard ERC-721 mint() function selector
    const data = '0x1249c58b'; 

    console.log('📤 Sending mint transaction...', {
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
          data: data, // Call the mint function
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
