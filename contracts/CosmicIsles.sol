// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CosmicIslesBadge is ERC721, Ownable {
    using Strings for uint256;
    
    uint256 public nextTokenId;
    uint256 public constant MINT_PRICE = 0.0001 ether;
    
    // Base URI for metadata - should point to your API endpoint
    string private _baseTokenURI;
    
    // Optional: Store metadata URI per token (if you want per-token metadata)
    mapping(uint256 => string) private _tokenURIs;

    constructor(string memory baseURI) ERC721("Cosmic Isles Badge", "COSMIC") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    function mint() external payable {
        require(msg.value >= MINT_PRICE, "Insufficient ETH sent");
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // Set base URI for metadata (owner only)
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    // Set token-specific URI (owner only, for custom metadata per token)
    function setTokenURI(uint256 tokenId, string memory tokenURI) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _tokenURIs[tokenId] = tokenURI;
    }
    
    // Return token URI - required for Farcaster/OpenSea to display NFT
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        
        // If token has specific URI, use it
        if (bytes(_tokenURIs[tokenId]).length > 0) {
            return _tokenURIs[tokenId];
        }
        
        // Otherwise, use base URI + token ID
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, tokenId.toString()))
            : "";
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
}
