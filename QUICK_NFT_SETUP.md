# 🚀 Quick NFT Contract Setup

## The Problem
You're seeing "NFT CONTRACT NOT CONFIGURED" because the contract address isn't set.

## ⚠️ IMPORTANT: Production vs Local

- **For Production (Vercel)**: Set environment variables in Vercel Dashboard (see `VERCEL_ENV_SETUP.md`)
- **For Local Development**: Use `.env.local` file (see below)

## Quick Fix (2 Steps)

### Step 1: Deploy the Contract

**Option A: Using Remix (Recommended - No coding required)**

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Click "New File" → Name it `CosmicIsles.sol`
3. Copy the entire contents of `contracts/CosmicIsles.sol` and paste into Remix
4. Click "Compile" tab → Click "Compile CosmicIsles.sol"
5. Click "Deploy & Run Transactions" tab:
   - Environment: Select **"Injected Provider - MetaMask"** (or your wallet)
   - Make sure your wallet is connected and on **Base network** (Chain ID: 8453)
   - In the constructor field, enter: `"https://farcaster.xyz/miniapps/Hys_Qc3Q5KF_/cosmic-isles/api/nft/"`
   - Click **"Deploy"**
   - Confirm the transaction in your wallet
6. **Copy the deployed contract address** (starts with `0x...`)

**Option B: Already Have a Contract?**
- If you've already deployed, just get the address from:
  - BaseScan: https://basescan.org (search your wallet address)
  - Your deployment tool/transaction receipt

### Step 2: Configure the App

**For Production (Vercel):**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → Settings → Environment Variables
3. Add: `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` = `0xYourContractAddressHere`
4. Select **Production** environment
5. **Redeploy** your project

**For Local Development:**
1. Create `.env.local` in the project root (same folder as `package.json`)
2. Add this line (replace with YOUR contract address):

```bash
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xYourContractAddressHere
```

**Example:**
```bash
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

3. **Restart your dev server** (stop and run `npm run dev` again)

**📖 See `VERCEL_ENV_SETUP.md` for detailed Vercel instructions**

## Verify It Works

1. Complete the game and reach the mint screen
2. Click "Mint NFT"
3. Check the console - you should see:
   ```
   ✅ Step 1 SUCCESS: Contract address found
   📤 Contract: 0xYourAddress...
   ```

## Troubleshooting

**"Still says not configured"**
- Make sure `.env.local` is in the root directory (not in `src/`)
- Make sure the variable name is exactly: `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`
- Restart your dev server after creating/editing `.env.local`

**"Contract deployed but mint fails"**
- Check the contract address is correct (starts with `0x` and is 42 characters)
- Verify the contract is on Base network (not Ethereum mainnet)
- Make sure the contract has the `mint()` function

**"Need Base network in wallet?"**
- Add Base network manually:
  - Network Name: `Base`
  - RPC URL: `https://mainnet.base.org`
  - Chain ID: `8453`
  - Currency Symbol: `ETH`
  - Block Explorer: `https://basescan.org`

## What Happens After Setup?

Once configured:
1. Users can mint NFTs when they complete the game
2. NFTs will appear in their Farcaster Collectables (after indexing)
3. Each NFT costs 0.0001 ETH (set in the contract)
4. Metadata is automatically served from `/api/nft/[tokenId]`

## Need Help?

Check the full documentation:
- `NFT_SETUP.md` - Detailed deployment guide
- `NFT_METADATA_SETUP.md` - Metadata configuration
