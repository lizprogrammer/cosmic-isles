export const BASE_CHAIN_ID = '0x2105'; // 8453
export const BASE_SEPOLIA_CHAIN_ID = '0x14a34'; // 84532

export interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}

/**
 * Check if we're running in Farcaster/Warpcast environment
 */
const isInFarcaster = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    const { default: sdk } = await import("@farcaster/miniapp-sdk");
    const context = await sdk.context;
    return !!context;
  } catch (error) {
    return false;
  }
};

/**
 * Get Farcaster SDK wallet provider - this is the correct way to access Farcaster wallet
 */
const getFarcasterProvider = async (): Promise<EthereumProvider | null> => {
  if (typeof window === 'undefined') return null;
  
  try {
    const { default: sdk } = await import("@farcaster/miniapp-sdk");
    
    console.log('🔍 Checking Farcaster SDK...', {
      hasWallet: !!sdk.wallet,
      walletMethods: sdk.wallet ? Object.keys(sdk.wallet) : []
    });
    
    // Ensure SDK is ready
    try {
      await sdk.actions.ready();
      console.log('✅ Farcaster SDK ready');
    } catch (readyError) {
      console.log('⚠️ SDK ready() failed (might already be ready):', readyError);
    }
    
    // Check if we're in Farcaster environment
    const context = await sdk.context;
    if (!context) {
      console.log('⚠️ Not in Farcaster environment - no context available');
      return null;
    }
    
    console.log('🔍 Farcaster context found:', {
      hasWallet: !!(context as any).wallet,
      walletAddress: (context as any).wallet?.address,
      contextKeys: Object.keys(context)
    });
    
    // Method 1: Use the SDK's wallet.getEthereumProvider() method (official way)
    if (sdk.wallet && typeof sdk.wallet.getEthereumProvider === 'function') {
      try {
        const providerResult = sdk.wallet.getEthereumProvider();
        // Handle both Promise and direct return
        const provider = providerResult instanceof Promise 
          ? await providerResult 
          : providerResult;
        console.log('✅ Using Farcaster SDK getEthereumProvider()');
        // The provider should have a request method
        if (provider && typeof (provider as any).request === 'function') {
          return provider as EthereumProvider;
        }
      } catch (err) {
        console.log('⚠️ getEthereumProvider() failed:', err);
      }
    }
    
    // Method 2: Check if wallet is available directly as EIP-1193 provider
    if (sdk.wallet && typeof sdk.wallet.request === 'function') {
      console.log('✅ Using Farcaster SDK wallet.request() directly');
      return sdk.wallet as EthereumProvider;
    }
    
    // Method 3: Check if wallet is exposed on window (some SDK versions)
    if ((window as any).farcaster?.wallet) {
      console.log('✅ Using Farcaster wallet from window.farcaster');
      return (window as any).farcaster.wallet as EthereumProvider;
    }
    
    // Method 4: Use context wallet address and create minimal provider
    const contextWallet = (context as any).wallet;
    if (contextWallet?.address) {
      console.log('✅ Found Farcaster wallet address in context:', contextWallet.address);
      // Return a provider that can at least get the address
      // Note: Transactions might need the actual provider
      return {
        request: async (args: { method: string; params?: any[] }) => {
          if (args.method === 'eth_requestAccounts' || args.method === 'eth_accounts') {
            return [contextWallet.address];
          }
          if (args.method === 'eth_chainId') {
            return BASE_CHAIN_ID; // Farcaster uses Base
          }
          // For transactions, try to find the actual provider
          throw new Error('Transaction methods require Farcaster wallet provider. Please ensure you are using the latest Warpcast version.');
        }
      } as EthereumProvider;
    }
    
    console.log('⚠️ Farcaster SDK available but no wallet access found');
    console.log('   SDK structure:', {
      sdkKeys: Object.keys(sdk),
      walletKeys: sdk.wallet ? Object.keys(sdk.wallet) : 'no wallet',
      contextKeys: Object.keys(context)
    });
  } catch (error) {
    console.error('❌ Farcaster SDK error:', error);
  }
  
  return null;
};

/**
 * Get wallet provider - tries Farcaster SDK first, then any EIP-1193 provider
 */
export const getProvider = async (): Promise<EthereumProvider | null> => {
  // Try Farcaster SDK first - this should work when in Farcaster/Warpcast
  const farcasterProvider = await getFarcasterProvider();
  
  if (farcasterProvider) {
    console.log('✅ Using Farcaster wallet provider - no MetaMask needed!');
    return farcasterProvider;
  }
  
  // Only fallback if we're NOT in Farcaster environment
  // Check if we're in Farcaster by looking for SDK context
  try {
    const { default: sdk } = await import("@farcaster/miniapp-sdk");
    const context = await sdk.context;
    if (context) {
      // We're in Farcaster but wallet provider not available
      console.error('❌ In Farcaster but wallet provider not accessible. Check SDK version.');
      return null; // Don't fallback to MetaMask if we're in Farcaster
    }
  } catch (e) {
    // Not in Farcaster, allow fallback
  }
  
  // Fallback to any EIP-1193 provider (only if not in Farcaster)
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
  // First check if we're in Farcaster
  const inFarcaster = await isInFarcaster();
  
  if (inFarcaster) {
    console.log('🔍 Detected Farcaster environment, using Farcaster wallet...');
  }
  
  // Try Farcaster SDK provider first - this is the primary method
  const provider = await getProvider();
  
  if (!provider) {
    if (inFarcaster) {
      alert("Unable to access Farcaster wallet. Please ensure you're using the latest version of Warpcast.");
    } else {
      alert("Please open this app in Warpcast or Farcaster to use your Farcaster wallet. External wallets are not supported.");
    }
    return null;
  }

  try {
    // Request accounts - this will use Farcaster wallet if available
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    if (accounts && accounts.length > 0) {
      const address = accounts[0];
      console.log('✅ Wallet connected:', address, inFarcaster ? '(Farcaster wallet)' : '(external wallet)');
      return address;
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
    // Convert to hex if needed
    const currentChainIdHex = typeof currentChainId === 'string' 
      ? currentChainId 
      : '0x' + currentChainId.toString(16);
    
    if (currentChainIdHex === chainId) {
      console.log('✅ Already on Base network');
      return true;
    }
    
    // Try to switch - Farcaster wallet should handle this
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
  // Get provider - this will be Farcaster wallet if available
  const provider = await getProvider();
  if (!provider) {
    console.error('No provider available for transaction');
    return null;
  }

  try {
    // Convert ETH to Wei (hex)
    const valueWei = BigInt(parseFloat(priceInEth) * 1e18).toString(16);
    const data = '0x1249c58b'; // mint() function selector

    console.log('📤 Sending mint transaction via Farcaster wallet...', {
      from: fromAddress,
      to: contractAddress,
      value: priceInEth + ' ETH',
      chainId: BASE_CHAIN_ID
    });

    // Use the provider (which is Farcaster wallet if available)
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

    console.log('✅ Transaction sent via Farcaster wallet:', txHash);
    return txHash;
  } catch (error) {
    console.error("❌ Mint transaction failed", error);
    return null;
  }
};
