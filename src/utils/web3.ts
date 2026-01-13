export const BASE_CHAIN_ID = '0x2105'; // 8453
export const BASE_SEPOLIA_CHAIN_ID = '0x14a34'; // 84532

export interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}

export const getProvider = (): EthereumProvider | null => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return (window as any).ethereum;
  }
  return null;
};

export const connectWallet = async (): Promise<string | null> => {
  const provider = getProvider();
  if (!provider) {
    alert("Please install a crypto wallet like Coinbase Wallet or MetaMask.");
    return null;
  }

  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error("User rejected connection", error);
    return null;
  }
};

export const switchToBase = async (isTestnet = false): Promise<boolean> => {
  const provider = getProvider();
  if (!provider) return false;

  const chainId = isTestnet ? BASE_SEPOLIA_CHAIN_ID : BASE_CHAIN_ID;
  
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
    return true;
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (error.code === 4902) {
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
        return true;
      } catch (addError) {
        console.error(addError);
      }
    }
    console.error(error);
    return false;
  }
};

export const sendMintTransaction = async (
  contractAddress: string,
  priceInEth: string,
  fromAddress: string
): Promise<string | null> => {
  const provider = getProvider();
  if (!provider) return null;

  try {
    // Convert ETH to Wei (hex)
    // 1 ETH = 10^18 Wei. 0.001 ETH = 10^15 Wei.
    // Simple conversion for standard values
    const valueWei = BigInt(parseFloat(priceInEth) * 1e18).toString(16);
    
    // Encoded 'mint()' function call selector: 0x1249c58b (example)
    // For a standard mint(), it might just be the payable fallback or a specific function.
    // We'll assume a standard 'mint()' function with no args for simplicity, 
    // or the user can provide the data. 
    // Selector for `mint()` is `0x1249c58b`.
    const data = '0x1249c58b'; 

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

    return txHash;
  } catch (error) {
    console.error("Mint transaction failed", error);
    return null;
  }
};
