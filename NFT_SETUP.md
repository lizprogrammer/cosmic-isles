# 🎨 NFT Minting Setup Guide

To enable real NFT minting for Cosmic Isles on Farcaster (Base chain), follow these steps to deploy a smart contract and configure the app.

## 1. Deploy Smart Contract

You need to deploy a simple ERC-721 contract to the Base network (or Base Sepolia for testing).

### A. Using Remix (Easiest)
1. Go to [Remix IDE](https://remix.ethereum.org/).
2. Create a new file `CosmicIsles.sol` and paste the code from `contracts/CosmicIsles.sol`.
3. Compile the contract.
4. In the "Deploy & Run Transactions" tab:
   - Select **Injected Provider - MetaMask** as the environment.
   - Connect your wallet (ensure you are on Base or Base Sepolia).
   - **IMPORTANT**: In the constructor parameters, enter your metadata API base URL:
     - For production: `"https://your-domain.com/api/nft/"`
     - For testing: `"https://your-domain.com/api/nft/"`
   - Click **Deploy**.
5. Copy the **Deployed Contract Address**.

### B. Using Hardhat/Foundry
If you have a local dev environment, deploy `contracts/CosmicIsles.sol` using your preferred tool.

## 2. Configure Environment

Once you have your contract address, you need to tell the app where to send the mint transaction.

1. Open (or create) `.env.local` in the root directory.
2. Add the following line:

```bash
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=your_deployed_contract_address_here
```

Example:
```bash
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

## 3. Verify Implementation

The game is pre-configured to handle the minting process:
- **Network**: Automatically switches users to Base (Chain ID 8453).
- **Price**: Hardcoded to `0.0001 ETH` in `src/game/scenes/MintScreen.ts` (Update this if your contract price differs).
- **Method**: Calls the standard `mint()` function.
- **Metadata**: Contract includes `tokenURI()` function that returns metadata from `/api/nft/[tokenId]`

## 3.5. Metadata Setup (Required for Farcaster Collectables)

For NFTs to appear in Farcaster's collectables section:

1. **Metadata API**: Already created at `/api/nft/[tokenId]`
2. **Image**: Ensure `/sprites/star-fragment.png` is publicly accessible
3. **Contract Base URI**: Set during deployment (see step 1A above)

**Verify Metadata**:
- After deployment, check: `https://your-domain.com/api/nft/1`
- Should return valid JSON with `name`, `description`, `image`, and `attributes`

See `NFT_METADATA_SETUP.md` for detailed metadata configuration.

## 4. Farcaster Frame / Mini-App

Ensure your Farcaster manifest (`public/.well-known/farcaster.json`) points to your production URL. 

When a user clicks "MINT NFT":
1. Their wallet will open.
2. They will be asked to switch to Base.
3. They will sign a transaction to your contract.
4. Once confirmed, they can share a Cast about their achievement!
