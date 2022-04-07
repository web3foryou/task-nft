//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract NFT721 is ERC721, AccessControl {
    mapping(uint256 => string) private _metadata;
    uint public lastTokenId;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(address to, string memory metadata) external onlyMember{
        lastTokenId++;

        _mint(to, lastTokenId);

        _metadata[lastTokenId] = metadata;
    }

    function addAdmin(address addr) external onlyMember{
        _setupRole(DEFAULT_ADMIN_ROLE, addr);
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");

        return _metadata[_tokenId];
    }

    modifier onlyMember() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Restricted to members.");
        _;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}
