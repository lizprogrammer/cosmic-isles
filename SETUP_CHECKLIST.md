# ✅ NFT Setup Checklist

Follow these steps in order. Check off each one as you complete it.

## 📋 Pre-Deployment Checklist

- [ ] I have a crypto wallet (MetaMask, Coinbase Wallet, etc.)
- [ ] My wallet is connected and unlocked
- [ ] I have some ETH on Base network (for gas fees)
- [ ] I know my Vercel login credentials

## 🚀 Step 1: Deploy Contract

- [ ] Opened https://remix.ethereum.org/
- [ ] Created new file `CosmicIsles.sol`
- [ ] Copied code from `contracts/CosmicIsles.sol`
- [ ] Compiled successfully (green checkmark ✅)
- [ ] Connected wallet in Remix
- [ ] Switched to Base network (Chain ID: 8453)
- [ ] Entered constructor: `https://farcaster.xyz/miniapps/Hys_Qc3Q5KF_/cosmic-isles/api/nft/`
- [ ] Clicked "Deploy" and confirmed transaction
- [ ] **COPIED THE CONTRACT ADDRESS** (starts with `0x...`)
  - My contract address: `0x________________________________`

## ⚙️ Step 2: Configure Vercel

- [ ] Opened https://vercel.com/dashboard
- [ ] Selected my "cosmic-isles" project
- [ ] Went to Settings → Environment Variables
- [ ] Added new variable:
  - Key: `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`
  - Value: `0x________________________________` (my contract address)
  - Environment: ✅ Production
- [ ] Clicked "Save"
- [ ] Went to Deployments tab
- [ ] Clicked "..." → "Redeploy"
- [ ] Waited for deployment to complete (1-2 minutes)

## ✅ Step 3: Verify

- [ ] Opened my production app URL
- [ ] Opened browser console (F12)
- [ ] Completed game to mint screen
- [ ] Clicked "Mint NFT"
- [ ] Console shows: `✅ Step 1 SUCCESS: Contract address found`
- [ ] **NOT** showing: `❌ CRITICAL: No NFT contract address configured!`

## 🎉 Success!

If all checkboxes are checked and you see the success message, you're done!

---

## 🆘 Stuck on a Step?

- **Step 1 Issues?** → See `DEPLOY_CONTRACT_GUIDE.md` Part 1
- **Step 2 Issues?** → See `VERCEL_ENV_SETUP.md`
- **Step 3 Issues?** → Check Troubleshooting section in `DEPLOY_CONTRACT_GUIDE.md`

---

## 📝 Notes

Write down important info here:

**Contract Address**: `0x________________________________`

**Deployment Transaction**: `0x________________________________`

**BaseScan Link**: `https://basescan.org/address/0x________________________________`

**Vercel Project**: ________________________________
