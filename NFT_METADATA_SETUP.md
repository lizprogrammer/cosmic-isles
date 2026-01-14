# 🎨 NFT Metadata Setup for Farcaster Collectables

To ensure your NFTs appear in Farcaster's collectables section, you need to set up proper ERC-721 metadata.

## 1. Deploy Contract with Base URI

When deploying the contract, you need to provide a base URI that points to your metadata API:

```solidity
// In Remix or your deployment script:
constructor("https://your-domain.com/api/nft/")
```

This tells the contract where to find metadata for each token.

## 2. Contract Deployment Steps

1. **Deploy to Base Network**:
   - Go to [Remix IDE](https://remix.ethereum.org/)
   - Use the updated `contracts/CosmicIsles.sol` (now includes `tokenURI()`)
   - Set constructor parameter: `"https://your-domain.com/api/nft/"`
   - Deploy to Base network

2. **Set Contract Address**:
   ```bash
   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=your_contract_address_here
   ```

## 3. Metadata API Endpoint

The metadata endpoint is already created at `/api/nft/[tokenId]`.

**Current Implementation**: Returns template metadata.

**To Store Real Metadata**: Update the endpoint to:
1. Store metadata in a database when NFT is minted
2. Retrieve stored metadata by tokenId
3. Return ERC-721 compliant JSON

## 4. Metadata Format (ERC-721 Standard)

Your metadata must follow this format:

```json
{
  "name": "Cosmic Isles Badge #1",
  "description": "A legendary achievement NFT from Cosmic Isles",
  "image": "https://your-domain.com/sprites/star-fragment.png",
  "external_url": "https://farcaster.xyz/miniapps/Hys_Qc3Q5KF_/cosmic-isles",
  "attributes": [
    {
      "trait_type": "Achievement",
      "value": "Star Reforged"
    },
    {
      "trait_type": "Islands Completed",
      "value": "3/3"
    },
    {
      "trait_type": "Badges",
      "value": "3"
    },
    {
      "trait_type": "Rarity",
      "value": "Epic"
    }
  ]
}
```

## 5. Image Requirements

- **Format**: PNG, JPG, or GIF
- **Size**: Recommended 512x512px or larger
- **Accessibility**: Must be publicly accessible via HTTPS
- **CORS**: Must allow cross-origin requests

## 6. Testing Metadata

After deployment:

1. **Check Token URI**:
   ```javascript
   // In Etherscan or BaseScan
   const tokenURI = await contract.tokenURI(1);
   // Should return: "https://your-domain.com/api/nft/1"
   ```

2. **Verify Metadata**:
   - Visit: `https://your-domain.com/api/nft/1`
   - Should return valid JSON metadata

3. **Check Farcaster**:
   - Mint an NFT
   - Check your Farcaster profile → Collectables
   - NFT should appear within a few minutes

## 7. Storing Metadata (Recommended)

For production, store metadata when minting:

1. **Update `/api/mint` route** to save metadata to database
2. **Link tokenId to metadata** in your database
3. **Update `/api/nft/[tokenId]`** to retrieve from database

Example database schema:
```sql
CREATE TABLE nft_metadata (
  token_id INTEGER PRIMARY KEY,
  name TEXT,
  description TEXT,
  image_url TEXT,
  attributes JSONB,
  minted_at TIMESTAMP,
  wallet_address TEXT
);
```

## 8. Verification

Once deployed and configured:

- ✅ Contract has `tokenURI()` function
- ✅ Base URI points to your metadata API
- ✅ Metadata API returns valid JSON
- ✅ Image is accessible
- ✅ NFT appears in Farcaster collectables

## Troubleshooting

**NFT not appearing in Farcaster?**
- Check contract is on Base network
- Verify `tokenURI()` returns valid URL
- Ensure metadata API is accessible
- Check image URL is publicly accessible
- Wait a few minutes for indexing

**Metadata not loading?**
- Check CORS headers on API
- Verify JSON is valid
- Check image URL is correct
- Ensure HTTPS (not HTTP)
