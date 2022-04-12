//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./NFT721.sol";
import "./ERC20Token.sol";
import "hardhat/console.sol";


contract Marketplace is Ownable {
    address private _nft;
    address private _token;
    uint private _minAuctionTime;
    uint private _minBids;

    enum TypeItem { NONE, BUY, AUCTION }

    struct Item {
        TypeItem typeItem; // тип айтема
        address  maxBider; // последний участник ставки
        uint price; // цена продажи / цена последней ставки на аукционе
        uint maxBid; // число ставок
        uint stratTime; // время начала аукциона
    }

    mapping(uint => Item) private data;

    constructor(address nft, address token, uint minAuctionTime, uint minBids) {
        _nft = nft;
        _token = token;
        _minAuctionTime = minAuctionTime;
        _minBids = minBids;
    }

    function createItem(address to, string memory metadata) public onlyOwner {
        NFT721(_nft).mint(to, metadata);
    }

    function listItem(uint nftId, uint price) public {
        require(NFT721(_nft).ownerOf(nftId) == msg.sender, "Not owner.");
        require(NFT721(_nft).getApproved(nftId) == address(this), "Not approved.");
        require(price > 0, "Bad price.");
        data[nftId].price = price;
        data[nftId].typeItem = TypeItem.BUY;
    }

    function buyItem(uint nftId) public payable {
        address owner = NFT721(_nft).ownerOf(nftId);

        require(NFT721(_nft).getApproved(nftId) == address(this), "Not approved.");
        require(data[nftId].price > 0, "Not available to buy");
        require(owner != msg.sender, "Already the owner.");
        require(msg.value >= data[nftId].price, "Bad amount.");

        NFT721(_nft).safeTransferFrom(owner, msg.sender, nftId);

        data[nftId].price = 0;
        data[nftId].typeItem = TypeItem.NONE;

        (bool sent,) = owner.call{value : msg.value}(""); // НАДО СДЕЛАТЬ ПАДЕНИЕ ДЛЯ ТЕСТА!

        require(sent, "Failed to send Ether");
    }

    function cancel(uint nftId) public {
        require(NFT721(_nft).ownerOf(nftId) == msg.sender, "Not owner.");
        data[nftId].price = 0;
        data[nftId].typeItem = TypeItem.NONE;
    }

    function checkPriceBuy(uint nftId) public view returns (uint){
        return data[nftId].price;
    }

    function listItemOnAuction(uint nftId) public {
        require(NFT721(_nft).ownerOf(nftId) == msg.sender, "Not owner.");
        require(NFT721(_nft).getApproved(nftId) == address(this), "Not approved.");
        require(data[nftId].typeItem == TypeItem.NONE, "Auction exist.");

        data[nftId].typeItem = TypeItem.AUCTION;
        data[nftId].stratTime = block.timestamp;
    }

    function makeBid(uint nftId, uint price) public {
        require(NFT721(_nft).ownerOf(nftId) != msg.sender, "Is owner.");
        require(data[nftId].typeItem == TypeItem.AUCTION, "Auction close.");
        require(price > data[nftId].price, "Small bid.");
        require(data[nftId].maxBider != msg.sender, "You are the last bider.");
        require(ERC20Token(_token).allowance(msg.sender, address(this)) >= price, "Don't have allowance");
        require(ERC20Token(_token).balanceOf(msg.sender) >= price, "Don't have balance");

        data[nftId].maxBid++;
        data[nftId].price = price;
        data[nftId].maxBider = msg.sender;
    }

    function finishAuction(uint nftId) public {
        require(data[nftId].typeItem == TypeItem.AUCTION, "Auction close.");
        require(data[nftId].maxBid >= _minBids, "Few bets.");
        require(data[nftId].stratTime + _minAuctionTime <= block.timestamp, "Little time has passed.");

        address owner = NFT721(_nft).ownerOf(nftId);

        SafeERC20.safeTransferFrom(
            ERC20Token(_token),
            data[nftId].maxBider,
            owner,
            data[nftId].price
        );

        ERC721(_nft).safeTransferFrom(
            owner,
            data[nftId].maxBider,
            nftId
        );

        data[nftId].typeItem = TypeItem.NONE;
        data[nftId].maxBid = 0;
        data[nftId].price = 0;
        data[nftId].stratTime = 0;
    }

    function cancelAuction(uint nftId) public {
        require(data[nftId].typeItem == TypeItem.AUCTION, "Auction close.");
        require(data[nftId].stratTime + _minAuctionTime <= block.timestamp, "Little time has passed.");

        data[nftId].typeItem = TypeItem.NONE;
        data[nftId].maxBid = 0;
        data[nftId].price = 0;
        data[nftId].stratTime = 0;
    }
    function auctionPrice(uint nftId) public view returns (uint){
        return data[nftId].price;
    }

//    modifier onlyMember() {
//        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Restricted to members.");
//        _;
//    }

}
