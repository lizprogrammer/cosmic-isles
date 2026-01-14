#!/bin/bash

echo "🚀 NFT Contract Setup Helper"
echo ""
echo "This script will help you configure your NFT contract address."
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 0
    fi
fi

echo ""
echo "Enter your deployed NFT contract address:"
echo "(Should start with 0x and be 42 characters long)"
read -p "Contract Address: " CONTRACT_ADDRESS

# Validate address format
if [[ ! $CONTRACT_ADDRESS =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo "❌ Invalid address format. Should be 0x followed by 40 hex characters."
    exit 1
fi

# Create or update .env.local
cat > .env.local << EOL
# NFT Contract Configuration
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=$CONTRACT_ADDRESS
EOL

echo ""
echo "✅ Configuration saved to .env.local"
echo ""
echo "📋 Contract Address: $CONTRACT_ADDRESS"
echo ""
echo "⚠️  IMPORTANT: Restart your dev server (npm run dev) for changes to take effect!"
echo ""
