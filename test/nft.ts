import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFT", function () {
  it("name, symbol, mint, ownerOf, balanceOf", async function () {
    const name = "NFT Token";
    const symbol = "NFT";
    const metadata = 'https://ipfs.io/ipfs/Qmbo9W4FBJ1iA8kRJjxqvfs93qe168HQkBUBhC3B112wKv';

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(name, symbol);
    await nft.deployed();

    const etfId = 1;
    // const metadata = '{"attributes":[{"trait_type":"base","value":"narwhal"},{"trait_type":"eyes","value":"sleepy"},{"trait_type":"mouth","value":"cute"},{"trait_type":"level","value":4},{"trait_type":"stamina","value":90.2},{"trait_type":"personality","value":"boring"},{"display_type":"boost_number","trait_type":"aqua_power","value":10},{"display_type":"boost_percentage","trait_type":"stamina_increase","value":5},{"display_type":"number","trait_type":"generation","value":1}],"description":"Friendly OpenSea Creature that enjoys long swims in the ocean.","external_url":"https://example.com/?token_id=3","image":"https://storage.googleapis.com/opensea-prod.appspot.com/creature/3.png","name":"Dave Starbelly"}';

    const [user, user2] = await ethers.getSigners();

    expect(await nft.name()).to.equal(name);
    expect(await nft.symbol()).to.equal(symbol);

    await nft.mint(user.address, etfId, metadata);

    expect(await nft.ownerOf(etfId)).to.equal(user.address);
    expect(await nft.balanceOf(user.address)).to.equal(1);

    console.log("tokenURI: " + await nft.tokenURI(etfId))
  });
});
