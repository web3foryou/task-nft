import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import {Contracts} from "../../app/config/contracts";

task("erc721Verify", "erc721Verify")
    .setAction(async (taskArgs, hre) => {
        let contracts = new Contracts(hre.hardhatArguments.network as string);

        await hre.run("verify:verify", {
            address: contracts.NFT721,
            constructorArguments: [
                "NFT721",
                "NFT721",
            ],
        });
    });

