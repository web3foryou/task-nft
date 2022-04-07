//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Marketplace.sol";
import "./NFT721.sol";

contract Clear {
    address private _marketplace;
    address private _nft;

    constructor(address marketplace, address nft) {
        _marketplace = marketplace;
        _nft = nft;
    }

    function listItem(uint nftId, uint price) public {
        Marketplace(_marketplace).listItem(nftId, price);
    }

    function approve(address to, uint256 tokenId) public {
        NFT721(_nft).approve(to, tokenId);
    }
}
