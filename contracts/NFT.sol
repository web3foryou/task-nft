//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721 {
    mapping(uint256 => string) private _metadata;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {

    }

    function mint(address to, uint256 tokenId, string memory metadata) external{
        _mint(to, tokenId);

        _metadata[tokenId] = metadata;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        return _metadata[tokenId];
    }

}
