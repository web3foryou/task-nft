import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";

task("nftMint", "mintNft")
    .addParam("address", "The account address")
    .addParam("id", "NFT ID")
    .setAction(async (taskArgs, hre) => {
        let CONTRACT_NFT_ADDRESS = process.env.CONTRACT_NFT_ADDRESS as string;
        if (hre.hardhatArguments.network == "rinkeby") {
            CONTRACT_NFT_ADDRESS = process.env.CONTRACT_TETHER_ADDRESS_ROPSTEN as string;
        } else if (hre.hardhatArguments.network == "ropsten") {
            CONTRACT_NFT_ADDRESS = process.env.CONTRACT_NFT_ADDRESS_ROPSTEN as string;
        }

        const ContractArtifact = require('../../artifacts/contracts/NFT.sol/NFT.json');

        const [signer] = await hre.ethers.getSigners();

        let contract = new hre.ethers.Contract(CONTRACT_NFT_ADDRESS, ContractArtifact.abi, signer);

        let contractSigner = contract.connect(signer);

        const metadata = 'https://ipfs.io/ipfs/Qmbo9W4FBJ1iA8kRJjxqvfs93qe168HQkBUBhC3B112wKv';

        let tx = await contractSigner.mint(taskArgs.address, taskArgs.id, metadata, {
            // gasLimit: 10000000,
            // gasPrice: 900000000
            // gasLimit: 2100000,
            // gasPrice: 8000000000
        });

        await tx.wait();

        console.log("ownerOf: " + await contract.ownerOf(taskArgs.id));
    });

