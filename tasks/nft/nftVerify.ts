import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import {Contracts} from "../../app/config/contracts";

task("nftVerify", "nftVerify")
    .setAction(async (taskArgs, hre) => {
        let contracts = new Contracts(hre.hardhatArguments.network as string);

        await hre.run("verify:verify", {
            address: contracts.NFT,
            constructorArguments: [
                "NFT",
                "NFT",
            ],
        });
    });

