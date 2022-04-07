// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, network } from "hardhat";
import {Contracts} from "../../app/config/contracts"

async function main() {
  let contracts = new Contracts(network.name);

  const minAuctionTime = 3 * 24 * 60 * 60; // 3 дня
  const minBids = 3; // минимальное число ставок
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(contracts.NFT721, contracts.ERC20, minAuctionTime, minBids);
  await marketplace.deployed();

  console.log("marketplace deployed to:", marketplace.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
