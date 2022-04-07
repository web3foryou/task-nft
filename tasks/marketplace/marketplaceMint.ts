import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import {Contracts} from "../../app/config/contracts"

task("marketplaceMint", "marketplaceMint")
    .setAction(async (taskArgs, hre) => {
        const [signer] = await hre.ethers.getSigners();

        let contracts = new Contracts(hre.hardhatArguments.network as string);

        const ContractArtifact = require('../../artifacts/contracts/Marketplace.sol/Marketplace.json');
        let contract = new hre.ethers.Contract(contracts.MARKETPLACE, ContractArtifact.abi, signer);
        let contractSigner = contract.connect(signer);

        const ContractArtifactNft = require('../../artifacts/contracts/NFT721.sol/NFT721.json');
        let nft = new hre.ethers.Contract(contracts.NFT721, ContractArtifactNft.abi, signer);

        console.log("MARKETPLACE: " + contracts.MARKETPLACE)

        const metadata = 'https://api.jsonbin.io/b/61665fa1aa02be1d44589bb9/3';

        let tx = await contractSigner.createItem(signer.address, metadata);
        await tx.wait();

        let id = await nft.lastTokenId();

        console.log("nft Id: " + id);
    });

