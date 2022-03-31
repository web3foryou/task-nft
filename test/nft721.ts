import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFT721", function () {
  it("name, symbol, mint, ownerOf, balanceOf, tokenURI, tokenURI url, tokenURI json, supportsInterface", async function () {
    const name = "NFT721";
    const symbol = "NFT721";
    const metadata = 'https://ipfs.io/ipfs/Qmbo9W4FBJ1iA8kRJjxqvfs93qe168HQkBUBhC3B112wKv';

    const NFT = await ethers.getContractFactory("NFT721");
    const nft = await NFT.deploy(name, symbol);
    await nft.deployed();

    const metadata2 = '{"attributes":[{"trait_type":"base","value":"narwhal"},{"trait_type":"eyes","value":"sleepy"},{"trait_type":"mouth","value":"cute"},{"trait_type":"level","value":4},{"trait_type":"stamina","value":90.2},{"trait_type":"personality","value":"boring"},{"display_type":"boost_number","trait_type":"aqua_power","value":10},{"display_type":"boost_percentage","trait_type":"stamina_increase","value":5},{"display_type":"number","trait_type":"generation","value":1}],"description":"Friendly OpenSea Creature that enjoys long swims in the ocean.","external_url":"https://example.com/?token_id=3","image":"https://storage.googleapis.com/opensea-prod.appspot.com/creature/3.png","name":"Dave Starbelly"}';

    const [user, user2] = await ethers.getSigners();

    expect(await nft.name()).to.equal(name);
    expect(await nft.symbol()).to.equal(symbol);

    await nft.mint(user.address, metadata);

    const id = await nft.lastTokenId();
    let idNoExists = ethers.BigNumber.from(Number(id) + 1).toString();

    expect(await nft.ownerOf(id)).to.equal(user.address);
    expect(await nft.balanceOf(user.address)).to.equal(1);
    expect(await nft.tokenURI(id)).to.equal(metadata);

    await expect(nft.tokenURI(idNoExists)).to.be.revertedWith('ERC721Metadata: URI query for nonexistent token');

    // проверить что в метаданных ссылка
    expect(isJson(await nft.tokenURI(id))).to.equal(false);

    // проверить что в метаданных json
    await nft.mint(user.address, metadata2);
    const id2 = await nft.lastTokenId();
    expect(isJson(await nft.tokenURI(id2))).to.equal(true);

    await expect(nft.connect(user2).mint(user2.address, metadata)).to.be.revertedWith('Restricted to members.');

    await nft.supportsInterface(ethers.utils.toUtf8Bytes("test"));
  });

  function isJson(str :string) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
});
