# 🚀 Step-by-Step: Deploy NFT Contract & Configure

## Part 1: Deploy the Contract (10 minutes)

### Step 1: Open Remix IDE
1. Go to **https://remix.ethereum.org/**
2. Wait for it to load completely

### Step 2: Create the Contract File
1. In the left sidebar, click **"File Explorer"**
2. Click the **"+"** icon (New File)
3. Name it: `CosmicIsles.sol`
4. Click **"OK"**

### Step 3: Copy the Contract Code
1. Open `contracts/CosmicIsles.sol` from your project
2. **Copy ALL the code** (Ctrl+A / Cmd+A, then Ctrl+C / Cmd+C)
3. Paste it into the Remix editor

### Step 4: Install Dependencies
1. In Remix, click **"Compile"** tab (left sidebar)
2. You'll see a warning about missing imports
3. Click **"Auto compile"** checkbox (top right)
4. Remix will automatically install OpenZeppelin contracts

### Step 5: Compile
1. Wait for auto-compile to finish (or click **"Compile CosmicIsles.sol"**)
2. You should see a green checkmark ✅
3. If errors appear, wait a moment - Remix is installing dependencies

### Step 6: Connect Your Wallet
1. Click **"Deploy & Run Transactions"** tab (left sidebar)
2. Under **"Environment"**, select: **"Injected Provider - MetaMask"**
   - (Or your wallet: Coinbase Wallet, etc.)
3. A popup will ask to connect - **Approve it**

### Step 7: Switch to Base Network
**IMPORTANT**: You must be on Base network, not Ethereum!

1. In your wallet, check the network
2. If you see "Ethereum Mainnet", click it
3. Click **"Add Network"** or **"Switch Network"**
4. Add Base network:
   - **Network Name**: `Base`
   - **RPC URL**: `https://mainnet.base.org`
   - **Chain ID**: `8453`
   - **Currency Symbol**: `ETH`
   - **Block Explorer**: `https://basescan.org`
5. **Switch to Base network**

### Step 8: Get Some ETH on Base
- You need a small amount of ETH on Base for gas fees (~$0.01-0.10)
- Bridge from Ethereum: https://bridge.base.org/
- Or use a faucet if on testnet

### Step 9: Deploy the Contract
1. In Remix, under **"Deploy"** section:
2. Find **"CONTRACT"** dropdown - select **"CosmicIslesBadge"**
3. Find the **constructor input field** (labeled `baseURI` or `string memory baseURI`)
4. Enter this EXACT text:
   ```
   https://farcaster.xyz/miniapps/Hys_Qc3Q5KF_/cosmic-isles/api/nft/
   ```
   (Include the quotes if Remix requires them, or don't if it doesn't)
5. Click **"Deploy"** button
6. **Confirm the transaction** in your wallet
7. Wait for confirmation (usually 10-30 seconds)

### Step 10: Copy the Contract Address
1. In Remix, under **"Deployed Contracts"** section
2. You'll see your contract listed
3. Click the **copy icon** next to the address (starts with `0x...`)
4. **SAVE THIS ADDRESS** - you'll need it next!

---

## Part 2: Configure Vercel (5 minutes)

### Step 1: Go to Vercel Dashboard
1. Open **https://vercel.com/dashboard**
2. **Sign in** if needed

### Step 2: Find Your Project
1. Find **"cosmic-isles"** (or your project name) in the list
2. **Click on it**

### Step 3: Open Settings
1. Click **"Settings"** tab (left sidebar, gear icon)
2. Scroll down to **"Environment Variables"** section
3. Click it to expand

### Step 4: Add the Variable
1. Click **"Add New"** button
2. Fill in:
   - **Key**: `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`
   - **Value**: Paste your contract address (the `0x...` you copied)
   - **Environment**: Check **"Production"** (and optionally "Preview" and "Development")
3. Click **"Save"**

### Step 5: Redeploy
1. Click **"Deployments"** tab (left sidebar)
2. Find the **latest deployment** (top of list)
3. Click the **"..."** menu (three dots) on the right
4. Click **"Redeploy"**
5. Confirm **"Redeploy"**
6. Wait 1-2 minutes for deployment to complete

---

## Part 3: Verify It Works

### Step 1: Test the App
1. Go to your production URL
2. Complete the game (or use a test account)
3. Reach the **"Mint NFT"** screen
4. Click **"Mint NFT"** button

### Step 2: Check Console
1. Open browser **Developer Tools** (F12 or right-click → Inspect)
2. Go to **"Console"** tab
3. Click **"Mint NFT"** again
4. You should see:
   ```
   ✅ Step 1 SUCCESS: Contract address found
   📤 Contract: 0xYourAddress...
   ```
5. **NOT** this error:
   ```
   ❌ CRITICAL: No NFT contract address configured!
   ```

### Step 3: Test Minting
1. If the contract address is found, the wallet should open
2. You'll be asked to switch to Base network
3. Confirm the transaction
4. Wait for confirmation
5. Check BaseScan: `https://basescan.org/tx/YOUR_TX_HASH`

---

## Troubleshooting

### "Remix won't compile"
- Wait 30 seconds - Remix is installing dependencies
- Check for error messages in the compile tab
- Make sure you copied ALL the code from `contracts/CosmicIsles.sol`

### "Can't connect wallet"
- Make sure your wallet extension is installed and unlocked
- Try refreshing Remix page
- Try a different browser

### "Wrong network"
- Make sure you're on **Base** (Chain ID: 8453)
- Not Ethereum Mainnet (Chain ID: 1)
- Not Base Sepolia (Chain ID: 84532)

### "Insufficient funds"
- You need ETH on Base for gas fees
- Bridge from Ethereum: https://bridge.base.org/
- Or get testnet ETH if using Base Sepolia

### "Contract deployed but Vercel still shows error"
- Wait 2-3 minutes after redeploy
- Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
- Check Vercel deployment logs to ensure variable was included
- Verify variable name is exactly: `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` (case-sensitive)

### "Transaction fails when minting"
- Verify contract address is correct in Vercel
- Check contract is on Base network (not Ethereum)
- Make sure contract has the `mint()` function
- Check you have enough ETH for mint price (0.0001 ETH) + gas

---

## Need More Help?

- **Contract Issues**: Check `NFT_SETUP.md`
- **Vercel Issues**: Check `VERCEL_ENV_SETUP.md`
- **Metadata Issues**: Check `NFT_METADATA_SETUP.md`

---

## Quick Reference

**Contract Address Format**: `0x` + 40 hex characters = 42 characters total
**Base Network**: Chain ID `8453`
**Mint Price**: `0.0001 ETH` (set in contract)
**Metadata URL**: `https://farcaster.xyz/miniapps/Hys_Qc3Q5KF_/cosmic-isles/api/nft/`
