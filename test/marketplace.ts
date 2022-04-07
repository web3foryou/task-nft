import { expect } from "chai";
import { ethers } from "hardhat";

describe("marketplace", function () {
  it("createItem, mint, listItem, buyItem, cancel, listItemOnAuction, makeBid, finishAuction, cancelAuction", async function () {
    const [user, user2, user3, user4] = await ethers.getSigners();

    const name = "NFT721";
    const symbol = "NFT721";
    // const metadata = 'https://ipfs.io/ipfs/Qmbo9W4FBJ1iA8kRJjxqvfs93qe168HQkBUBhC3B112wKv';
    const metadata = 'https://api.jsonbin.io/b/61665fa1aa02be1d44589bb9/3';

    const NFT = await ethers.getContractFactory("NFT721");
    const nft = await NFT.deploy(name, symbol);
    await nft.deployed();

    const nameErc20 = "ERC20 Token";
    const symbolErc20 = "ERC20";
    const erc20Factory = await ethers.getContractFactory("ERC20Token");
    let mintBalance = ethers.utils.parseEther("1000000.0");
    const erc20 = await erc20Factory.deploy(nameErc20, symbolErc20, mintBalance);
    const balanceTokens = ethers.utils.parseEther("10.0");
    await erc20.transfer(user2.address, balanceTokens);
    await erc20.transfer(user3.address, balanceTokens);

    expect(await nft.name()).to.equal(name);
    expect(await nft.symbol()).to.equal(symbol);

    await nft.mint(user.address, metadata);
    await nft.addAdmin(user2.address);
    await nft.connect(user2).mint(user.address, metadata);

    // деплоим маркетплейс
    const minAuctionTime = 3 * 24 * 60 * 60; // 3 дня
    const minBids = 3; // минимальное число ставок
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(nft.address, erc20.address, minAuctionTime, minBids);
    await marketplace.deployed();

    await nft.addAdmin(marketplace.address);

    // ПРОВЕРКА ПОКУПКИ ==========
    expect(await nft.balanceOf(user.address)).to.equal(2);
    await marketplace.createItem(user.address, metadata);
    expect(await nft.balanceOf(user.address)).to.equal(3);

    const id = await nft.lastTokenId();

    await nft.approve(marketplace.address, id);
    expect(await nft.getApproved(id)).to.equal(marketplace.address);

    const price = ethers.utils.parseEther("1.0");

    await marketplace.listItem(id, price);

    const options = {value: price}
    // console.log("getBalance: " + await ethers.provider.getBalance(marketplace.address))

    await marketplace.connect(user2).buyItem(id, options);
    expect(await nft.ownerOf(id)).to.equal(user2.address);
    // КОНЕЦ: ПРОВЕРКА ПОКУПКИ ==========


    // ПРОВЕРКА ОТМЕНЫ ==========
    await marketplace.createItem(user.address, metadata);
    const id2 = await nft.lastTokenId();
    await nft.approve(marketplace.address, id2);
    await marketplace.listItem(id2, price);

    expect(await marketplace.checkPriceBuy(id2)).to.equal(price);
    await marketplace.cancel(id2);
    expect(await marketplace.checkPriceBuy(id2)).to.equal(0);
    // КОНЕЦ: ПРОВЕРКА ОТМЕНЫ ==========

    // АУКЦИОН ==========
    await marketplace.createItem(user4.address, metadata);
    const id3 = await nft.lastTokenId();
    await nft.connect(user4).approve(marketplace.address, id3);
    await marketplace.connect(user4).listItemOnAuction(id3);
    expect(await marketplace.auctionStatus(id3)).to.equal(true);

    const auctionPrice1 = ethers.utils.parseEther("1.0");
    await erc20.connect(user2).approve(marketplace.address, auctionPrice1);
    await marketplace.connect(user2).makeBid(id3, auctionPrice1);
    expect(await marketplace.auctionPrice(id3)).to.equal(auctionPrice1);

    const auctionPrice2 = ethers.utils.parseEther("2.0");
    await erc20.connect(user3).approve(marketplace.address, auctionPrice2);
    await marketplace.connect(user3).makeBid(id3, auctionPrice2);
    expect(await marketplace.auctionPrice(id3)).to.equal(auctionPrice2);

    const auctionPrice3 = ethers.utils.parseEther("3.0");
    await erc20.connect(user2).approve(marketplace.address, auctionPrice3);
    await marketplace.connect(user2).makeBid(id3, auctionPrice3);
    expect(await marketplace.auctionPrice(id3)).to.equal(auctionPrice3);

    await ethers.provider.send("evm_increaseTime", [minAuctionTime]);
    await ethers.provider.send("evm_mine", []);

    await marketplace.finishAuction(id3);
    expect(await nft.ownerOf(id3)).to.equal(user2.address);
    expect(await erc20.balanceOf(user4.address)).to.equal(auctionPrice3);
    // КОНЕЦ: АУКЦИОН ==========

    // АУКЦИОН ОТМЕНА ==========
    await marketplace.createItem(user4.address, metadata);
    const id4 = await nft.lastTokenId();
    await nft.connect(user4).approve(marketplace.address, id4);
    await marketplace.connect(user4).listItemOnAuction(id4);
    expect(await marketplace.auctionStatus(id4)).to.equal(true);
    await ethers.provider.send("evm_increaseTime", [minAuctionTime]);
    await ethers.provider.send("evm_mine", []);

    await marketplace.cancelAuction(id4);
    expect(await marketplace.auctionStatus(id4)).to.equal(false);
    // КОНЕЦ: АУКЦИОН ОТМЕНА ==========
  });
});
