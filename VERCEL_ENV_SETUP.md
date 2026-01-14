# 🚀 Vercel Environment Variable Setup

## The Problem
You're seeing "NFT CONTRACT NOT CONFIGURED" because the environment variable isn't set in **Vercel's production environment**.

**Important**: `.env.local` only works for **local development**. For production on Vercel, you must set environment variables in the Vercel dashboard.

## Quick Fix (5 Minutes)

### Step 1: Get Your Contract Address

If you haven't deployed the contract yet:
1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create `CosmicIsles.sol` and paste code from `contracts/CosmicIsles.sol`
3. Compile and deploy to **Base network**
4. Constructor parameter: `"https://farcaster.xyz/miniapps/Hys_Qc3Q5KF_/cosmic-isles/api/nft/"`
5. Copy the deployed contract address (starts with `0x...`)

### Step 2: Set Environment Variable in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your **Cosmic Isles** project

2. **Navigate to Settings**
   - Click on your project
   - Click **"Settings"** tab (left sidebar)
   - Click **"Environment Variables"** (under Configuration)

3. **Add the Variable**
   - Click **"Add New"** button
   - **Key**: `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`
   - **Value**: Your contract address (e.g., `0x1234567890abcdef1234567890abcdef12345678`)
   - **Environment**: Select **Production** (and optionally Preview/Development)
   - Click **"Save"**

4. **Redeploy**
   - Go to **"Deployments"** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**
   - OR push a new commit to trigger a redeploy

### Step 3: Verify

After redeploy, check the console when clicking "Mint NFT":
- ✅ Should see: `✅ Step 1 SUCCESS: Contract address found`
- ❌ Should NOT see: `❌ CRITICAL: No NFT contract address configured!`

## Alternative: Using Vercel CLI

If you prefer command line:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variable
vercel env add NEXT_PUBLIC_NFT_CONTRACT_ADDRESS production

# Enter your contract address when prompted
# Then redeploy
vercel --prod
```

## For Local Development

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xYourContractAddressHere
```

**Note**: This only affects local development. Production uses Vercel's environment variables.

## Troubleshooting

**"Still seeing the error after redeploy"**
- Wait 1-2 minutes for the new deployment to propagate
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check Vercel deployment logs to ensure the variable was included
- Verify the variable name is exactly: `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` (case-sensitive)

**"How do I know if it's working?"**
- Check browser console when clicking "Mint NFT"
- Look for: `📤 Contract: 0x...` in the debug logs
- The error message should disappear

**"Need to update the contract address?"**
- Go to Vercel → Settings → Environment Variables
- Edit the existing variable
- Redeploy the project

## What Happens Next?

Once configured:
1. Users can mint NFTs when completing the game
2. Each mint costs 0.0001 ETH (set in contract)
3. NFTs appear in Farcaster Collectables after indexing
4. Metadata is served from `/api/nft/[tokenId]`

## Need Help?

- Check `QUICK_NFT_SETUP.md` for contract deployment details
- Check `NFT_SETUP.md` for full setup guide
- Verify contract is on Base network (not Ethereum mainnet)
