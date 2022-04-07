import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import {Contracts} from "../../app/config/contracts";

task("marketplaceVerify", "marketplaceVerify")
    .setAction(async (taskArgs, hre) => {
        let contracts = new Contracts(hre.hardhatArguments.network as string);
        const minAuctionTime = 3 * 24 * 60 * 60; // 3 дня
        const minBids = 3; // минимальное число ставок

        await hre.run("verify:verify", {
            address: contracts.MARKETPLACE,
            constructorArguments: [
                contracts.NFT721,
                contracts.ERC20,
                minAuctionTime,
                minBids
            ],
        });
    });

