import { expect } from "chai";
import { ethers } from "hardhat";

describe("marketplace", function () {
  it("reject branch", async function () {
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

    const Clear = await ethers.getContractFactory("Clear");
    const clear = await Clear.deploy(marketplace.address, nft.address);
    await clear.deployed();

    await nft.addAdmin(marketplace.address);

    // ПРОВЕРКА ПОКУПКИ ==========
    expect(await nft.balanceOf(user.address)).to.equal(2);

    //onlyMember -> Restricted to members.
    await expect(marketplace.connect(user2).createItem(user.address, metadata))
        .to.be.revertedWith('Restricted to members.');

    await marketplace.createItem(user.address, metadata);
    expect(await nft.balanceOf(user.address)).to.equal(3);

    const id = await nft.lastTokenId();
    const price = ethers.utils.parseEther("1.0");

    //listItem -> Not approved.
    await expect(marketplace.listItem(id, price))
        .to.be.revertedWith('Not approved.');

    const options = {value: price}

    //buyItem -> Not approved."
    await expect(marketplace.connect(user2).buyItem(id, options))
        .to.be.revertedWith('Not approved.');

    await nft.approve(marketplace.address, id);
    expect(await nft.getApproved(id)).to.equal(marketplace.address);

    //buyItem -> Not available to buy
    await expect(marketplace.connect(user2).buyItem(id, options))
        .to.be.revertedWith('Not available to buy');

    //listItem -> Bad price.
    await expect(marketplace.listItem(id, 0))
        .to.be.revertedWith('Bad price.');

    await marketplace.listItem(id, price);

    //listItem -> Not owner.
    await expect(marketplace.connect(user2).listItem(id, price))
        .to.be.revertedWith('Not owner.');

    //buyItem -> Already the owner.
    await expect(marketplace.buyItem(id, options))
        .to.be.revertedWith('Already the owner.');

    const priceBad = ethers.utils.parseEther("0.1");
    const optionsBad = {value: priceBad}

    //buyItem -> Bad amount.
    await expect(marketplace.connect(user2).buyItem(id, optionsBad))
        .to.be.revertedWith('Bad amount.');

    await marketplace.connect(user2).buyItem(id, options);
    expect(await nft.ownerOf(id)).to.equal(user2.address);
    // КОНЕЦ: ПРОВЕРКА ПОКУПКИ ==========

    // ПОРОДАЖА С ПУСТОГО КОНТРАКТА =================
    await marketplace.createItem(clear.address, metadata);
    const idClear = await nft.lastTokenId();
    await clear.approve(marketplace.address, idClear);
    await clear.listItem(idClear, price);
    expect(await nft.getApproved(idClear)).to.equal(marketplace.address);

    //buyItem -> Failed to send Ether
    await expect(marketplace.connect(user2).buyItem(idClear, options))
        .to.be.revertedWith('Failed to send Ether');
    // КОНЕЦ: ПОРОДАЖА С ПУСТОГО КОНТРАКТА ==========


    // ПРОВЕРКА ОТМЕНЫ ==========
    await marketplace.createItem(user.address, metadata);
    const id2 = await nft.lastTokenId();
    await nft.approve(marketplace.address, id2);
    await marketplace.listItem(id2, price);

    expect(await marketplace.checkPriceBuy(id2)).to.equal(price);

    //cancel -> Not owner.
    await expect(marketplace.connect(user2).cancel(id2))
        .to.be.revertedWith('Not owner.');

    await marketplace.cancel(id2);
    expect(await marketplace.checkPriceBuy(id2)).to.equal(0);
    // КОНЕЦ: ПРОВЕРКА ОТМЕНЫ ==========

    // АУКЦИОН ==========
    await marketplace.createItem(user4.address, metadata);
    const id3 = await nft.lastTokenId();

    //listItemOnAuction -> Not approved.
    await expect(marketplace.connect(user4).listItemOnAuction(id3))
        .to.be.revertedWith('Not approved.');

    await nft.connect(user4).approve(marketplace.address, id3);

    //listItemOnAuction -> Not owner.
    await expect(marketplace.connect(user2).listItemOnAuction(id3))
        .to.be.revertedWith('Not owner.');

    const auctionPrice1 = ethers.utils.parseEther("1.0");

    //makeBid -> Auction close.
    await expect(marketplace.connect(user2).makeBid(id3, auctionPrice1))
        .to.be.revertedWith('Auction close.');

    await marketplace.connect(user4).listItemOnAuction(id3);

    //listItemOnAuction -> Auction exist.
    await expect(marketplace.connect(user4).listItemOnAuction(id3))
        .to.be.revertedWith('Auction exist.');

    expect(await marketplace.auctionStatus(id3)).to.equal(true);

    //makeBid -> Don't have allowance
    await expect(marketplace.connect(user2).makeBid(id3, auctionPrice1))
        .to.be.revertedWith('Don\'t have allowance');

    await erc20.connect(user2).approve(marketplace.address, auctionPrice1);

    //makeBid -> Is owner.
    await expect(marketplace.connect(user4).makeBid(id3, auctionPrice1))
        .to.be.revertedWith('Is owner.');

    await marketplace.connect(user2).makeBid(id3, auctionPrice1);

    //makeBid -> Small bid.
    await expect(marketplace.connect(user2).makeBid(id3, auctionPrice1))
        .to.be.revertedWith('Small bid.');

    expect(await marketplace.auctionPrice(id3)).to.equal(auctionPrice1);

    //finishAuction -> Few bets.
    await expect(marketplace.connect(user2).finishAuction(id3))
        .to.be.revertedWith('Few bets.');

    const auctionPrice2 = ethers.utils.parseEther("2.0");

    //makeBid -> You are the last bider.
    await expect(marketplace.connect(user2).makeBid(id3, auctionPrice2))
        .to.be.revertedWith('You are the last bider.');

    await erc20.connect(user3).approve(marketplace.address, auctionPrice2);
    await marketplace.connect(user3).makeBid(id3, auctionPrice2);
    expect(await marketplace.auctionPrice(id3)).to.equal(auctionPrice2);

    const auctionPriceBig = ethers.utils.parseEther("30.0");
    await erc20.connect(user2).approve(marketplace.address, auctionPriceBig);

    //makeBid -> Don't have balance
    await expect(marketplace.connect(user2).makeBid(id3, auctionPriceBig))
        .to.be.revertedWith('Don\'t have balance');

    const auctionPrice3 = ethers.utils.parseEther("3.0");
    await erc20.connect(user2).approve(marketplace.address, auctionPrice3);
    await marketplace.connect(user2).makeBid(id3, auctionPrice3);
    expect(await marketplace.auctionPrice(id3)).to.equal(auctionPrice3);

    //finishAuction -> Little time has passed.
    await expect(marketplace.connect(user2).finishAuction(id3))
        .to.be.revertedWith('Little time has passed.');

    await ethers.provider.send("evm_increaseTime", [minAuctionTime]);
    await ethers.provider.send("evm_mine", []);

    await marketplace.finishAuction(id3);

    //finishAuction -> Auction close.
    await expect(marketplace.connect(user2).finishAuction(id3))
        .to.be.revertedWith('Auction close.');

    expect(await nft.ownerOf(id3)).to.equal(user2.address);
    expect(await erc20.balanceOf(user4.address)).to.equal(auctionPrice3);
    // КОНЕЦ: АУКЦИОН ==========

    // АУКЦИОН ОТМЕНА ==========
    await marketplace.createItem(user4.address, metadata);
    const id4 = await nft.lastTokenId();
    await nft.connect(user4).approve(marketplace.address, id4);
    await marketplace.connect(user4).listItemOnAuction(id4);
    expect(await marketplace.auctionStatus(id4)).to.equal(true);

    //cancelAuction -> Little time has passed.
    await expect(marketplace.connect(user2).cancelAuction(id4))
        .to.be.revertedWith('Little time has passed.');

    await ethers.provider.send("evm_increaseTime", [minAuctionTime]);
    await ethers.provider.send("evm_mine", []);

    await marketplace.cancelAuction(id4);

    //cancelAuction -> Auction close.
    await expect(marketplace.connect(user2).cancelAuction(id4))
        .to.be.revertedWith('Auction close.');

    expect(await marketplace.auctionStatus(id4)).to.equal(false);
    // КОНЕЦ: АУКЦИОН ОТМЕНА ==========
  });
});
