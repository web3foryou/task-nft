//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./NFT721.sol";
import "./ERC20Token.sol";
import "hardhat/console.sol";


contract Marketplace is AccessControl {
    address private _nft;
    address private _token;
    uint private _minAuctionTime;
    uint private _minBids;

    struct DataStruct {
        mapping(uint => uint) availableToBuy; // nftId => price
        mapping(uint => bool) auctionSw; // nftId => bool - включен акцион или нет
        mapping(uint => uint) auctionPrice; // nftId => price
        mapping(uint => uint) auctionBids; // nftId => bids
        mapping(uint => uint) auctionStartTime; // nftId => StartTime
        mapping(uint => address) auctionLastBider; // nftId => последний ставочник
    }

    DataStruct private data;

    constructor(address nft, address token, uint minAuctionTime, uint minBids) {
        _nft = nft;
        _token = token;
        _minAuctionTime = minAuctionTime;
        _minBids = minBids;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createItem(address to, string memory metadata) public onlyMember {
        NFT721(_nft).mint(to, metadata);
    }

    function listItem(uint nftId, uint price) public {
        require(NFT721(_nft).ownerOf(nftId) == msg.sender, "Not owner.");
        require(NFT721(_nft).getApproved(nftId) == address(this), "Not approved.");
        require(price > 0, "Bad price.");
        data.availableToBuy[nftId] = price;
    }

    function buyItem(uint nftId) public payable {
        address owner = NFT721(_nft).ownerOf(nftId);

        require(NFT721(_nft).getApproved(nftId) == address(this), "Not approved.");
        require(data.availableToBuy[nftId] > 0, "Not available to buy");
        require(owner != msg.sender, "Already the owner.");
        require(msg.value >= data.availableToBuy[nftId], "Bad amount.");

        NFT721(_nft).safeTransferFrom(owner, msg.sender, nftId);

        data.availableToBuy[nftId] = 0;

        (bool sent,) = owner.call{value : msg.value}(""); // НАДО СДЕЛАТЬ ПАДЕНИЕ ДЛЯ ТЕСТА!

        require(sent, "Failed to send Ether");
    }

    function cancel(uint nftId) public {
        require(NFT721(_nft).ownerOf(nftId) == msg.sender, "Not owner.");
        data.availableToBuy[nftId] = 0;
    }

    function checkPriceBuy(uint nftId) public view returns (uint){
        return data.availableToBuy[nftId];
    }

    function listItemOnAuction(uint nftId) public {
        require(NFT721(_nft).ownerOf(nftId) == msg.sender, "Not owner.");
        require(NFT721(_nft).getApproved(nftId) == address(this), "Not approved.");
        require(data.auctionSw[nftId] == false, "Auction exist.");

        data.auctionSw[nftId] = true;
        data.auctionStartTime[nftId] = block.timestamp;
    }

    function makeBid(uint nftId, uint price) public {
        require(NFT721(_nft).ownerOf(nftId) != msg.sender, "Is owner.");
        require(data.auctionSw[nftId] == true, "Auction close.");
        require(price > data.auctionPrice[nftId], "Small bid.");
        require(data.auctionLastBider[nftId] != msg.sender, "You are the last bider.");
        require(ERC20Token(_token).allowance(msg.sender, address(this)) >= price, "Don't have allowance");
        require(ERC20Token(_token).balanceOf(msg.sender) >= price, "Don't have balance");

        data.auctionBids[nftId]++;
        data.auctionPrice[nftId] = price;
        data.auctionLastBider[nftId] = msg.sender;
    }

    function finishAuction(uint nftId) public {
        require(data.auctionSw[nftId] == true, "Auction close.");
        require(data.auctionBids[nftId] >= _minBids, "Few bets.");
        require(data.auctionStartTime[nftId] + _minAuctionTime <= block.timestamp, "Little time has passed.");

        address owner = NFT721(_nft).ownerOf(nftId);

        SafeERC20.safeTransferFrom(
            ERC20Token(_token),
            data.auctionLastBider[nftId],
            owner,
            data.auctionPrice[nftId]
        );

        ERC721(_nft).safeTransferFrom(
            owner,
            data.auctionLastBider[nftId],
            nftId
        );

        data.auctionSw[nftId] = false;
        data.auctionBids[nftId] = 0;
        data.auctionPrice[nftId] = 0;
        data.auctionStartTime[nftId] = 0;
    }

    function cancelAuction(uint nftId) public {
        require(data.auctionSw[nftId] == true, "Auction close.");
        require(data.auctionStartTime[nftId] + _minAuctionTime <= block.timestamp, "Little time has passed.");

        data.auctionSw[nftId] = false;
        data.auctionBids[nftId] = 0;
        data.auctionPrice[nftId] = 0;
        data.auctionStartTime[nftId] = 0;
    }

    function auctionStatus(uint nftId) public view returns (bool){
        return data.auctionSw[nftId];
    }

    function auctionPrice(uint nftId) public view returns (uint){
        return data.auctionPrice[nftId];
    }

    modifier onlyMember() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Restricted to members.");
        _;
    }

}
