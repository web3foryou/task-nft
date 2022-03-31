//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract NFT1155 is ERC1155, AccessControl {
    mapping(uint256 => string) private _metadata;
    uint public lastTokenId;

    constructor(string memory uri_) ERC1155(uri_) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(address to, uint amount, string memory metadata) external onlyMember {
        bytes memory data;

        lastTokenId++;

        _mint(to, lastTokenId, amount, data);

        _metadata[lastTokenId] = metadata;
    }

    function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
        return _metadata[tokenId];
    }

    modifier onlyMember() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Restricted to members.");
        _;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
