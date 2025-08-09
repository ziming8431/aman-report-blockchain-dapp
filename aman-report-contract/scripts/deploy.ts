import { ethers } from "hardhat";

async function main() {
console.log("Deploying ConfidentialReporter contract...");

const contractFactory = await ethers.getContractFactory("ConfidentialReporter");
const contract = await contractFactory.deploy();

await contract.waitForDeployment();

const contractAddress = await contract.getAddress();
console.log(`ConfidentialReporter deployed to: ${contractAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
console.error(error);
process.exitCode = 1;
});
