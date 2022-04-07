import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import {Contracts} from "../../app/config/contracts"

task("marketplaceAddAdmin", "marketplaceAddAdmin")
    .setAction(async (taskArgs, hre) => {
        const [signer] = await hre.ethers.getSigners();

        let contracts = new Contracts(hre.hardhatArguments.network as string);

        const ContractArtifactNft = require('../../artifacts/contracts/NFT721.sol/NFT721.json');
        let nft = new hre.ethers.Contract(contracts.NFT721, ContractArtifactNft.abi, signer);
        let nftSigner = nft.connect(signer);

        let tx = await nftSigner.addAdmin(contracts.MARKETPLACE);
        await tx.wait();

        console.log("Done");
    });

