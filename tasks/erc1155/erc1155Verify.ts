import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import {Contracts} from "../../app/config/contracts";

task("erc1155Verify", "erc1155Verify")
    .setAction(async (taskArgs, hre) => {
        let contracts = new Contracts(hre.hardhatArguments.network as string);

        await hre.run("verify:verify", {
            address: contracts.NFT1155,
            constructorArguments: [
                "NFT1155",
            ],
        });
    });

