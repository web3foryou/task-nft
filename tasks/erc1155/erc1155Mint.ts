import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import {Contracts} from "../../app/config/contracts"

task("erc1155Mint", "erc1155Mint")
    .setAction(async (taskArgs, hre) => {
        let contracts = new Contracts(hre.hardhatArguments.network as string);

        const ContractArtifact = require('../../artifacts/contracts/NFT1155.sol/NFT1155.json');

        const [signer] = await hre.ethers.getSigners();

        let contract = new hre.ethers.Contract(contracts.NFT1155, ContractArtifact.abi, signer);

        let contractSigner = contract.connect(signer);

        // const metadata = 'https://ipfs.io/ipfs/Qmbo9W4FBJ1iA8kRJjxqvfs93qe168HQkBUBhC3B112wKv';
        const metadata = 'https://api.jsonbin.io/b/61665fa1aa02be1d44589bb9/3';

        // let tx = await contractSigner.mint(taskArgs.address, taskArgs.id, metadata, {});
        const amount = 10;
        let tx = await contractSigner.mint(signer.address, amount, metadata);

        await tx.wait();

        let id = await contract.lastTokenId();

        console.log("balanceOf: " + await contract.balanceOf(signer.address, id));
        console.log("lastId: " + id);
        console.log("tokenURI: " + await contract.tokenURI(id));
        console.log(("OpenSea: https://testnets.opensea.io/assets/" + contracts.NFT1155 + "/" + id).toLowerCase())
        console.log(("looksrare: https://rinkeby.looksrare.org/collections/" + contracts.NFT1155 + "/" + id).toLowerCase())
    });

