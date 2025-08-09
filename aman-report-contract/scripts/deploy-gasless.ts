import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Gasless Transaction System...");
  
  // Private key for the gasless signer (from user input)
  const GASLESS_SIGNER_PRIVATE_KEY = "0x1bd82ce6df3969cca1a9243cd074f3b3cf1513b024acbabf14fb2702d6a8feca";
  
  // Get the deployer
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Deploying contracts with the account:", deployerAddress);
  
  // Check if we have a valid deployer
  if (!deployer) {
    throw new Error("No deployer account found. Please check your private key in .env file.");
  }
  
  // Deploy ConfidentialReporter first
  console.log("\n1. Deploying ConfidentialReporter...");
  const ConfidentialReporter = await ethers.getContractFactory("ConfidentialReporter");
  const confidentialReporter = await ConfidentialReporter.deploy();
  await confidentialReporter.waitForDeployment();
  const reporterAddress = await confidentialReporter.getAddress();
  console.log(`ConfidentialReporter deployed to: ${reporterAddress}`);
  
  // Derive the gasless signer address from the private key
  const gaslessSignerWallet = new ethers.Wallet(GASLESS_SIGNER_PRIVATE_KEY);
  const gaslessSignerAddress = gaslessSignerWallet.address;
  console.log(`Gasless signer address: ${gaslessSignerAddress}`);
  
  // Deploy GaslessProxy
  console.log("\n2. Deploying GaslessProxy...");
  const GaslessProxy = await ethers.getContractFactory("GaslessProxy");
  const gaslessProxy = await GaslessProxy.deploy(reporterAddress, gaslessSignerAddress);
  await gaslessProxy.waitForDeployment();
  const proxyAddress = await gaslessProxy.getAddress();
  console.log(`GaslessProxy deployed to: ${proxyAddress}`);
  
  // Deploy GaslessSigner
  console.log("\n3. Deploying GaslessSigner...");
  const GaslessSigner = await ethers.getContractFactory("GaslessSigner");
  const gaslessSigner = await GaslessSigner.deploy(proxyAddress, GASLESS_SIGNER_PRIVATE_KEY);
  await gaslessSigner.waitForDeployment();
  const signerAddress = await gaslessSigner.getAddress();
  console.log(`GaslessSigner deployed to: ${signerAddress}`);
  
  // Update the proxy with the actual signer contract address
  console.log("\n3.1. Updating proxy with signer contract address...");
  await gaslessProxy.updateGaslessSigner(signerAddress);
  console.log("✓ Proxy updated with signer contract address");
  
  // Set up the relationships
  console.log("\n4. Setting up contract relationships...");
  
  // Set the gasless proxy in the ConfidentialReporter
  console.log("Setting gasless proxy in ConfidentialReporter...");
  await confidentialReporter.setGaslessProxy(proxyAddress);
  console.log("✓ Gasless proxy set in ConfidentialReporter");
  
  // Verify the setup
  console.log("\n5. Verifying setup...");
  const setProxyAddress = await confidentialReporter.gaslessProxy();
  const targetContract = await gaslessProxy.targetContract();
  const proxySignerAddress = await gaslessProxy.gaslessSignerAddress();
  
  console.log(`✓ ConfidentialReporter gasless proxy: ${setProxyAddress}`);
  console.log(`✓ GaslessProxy target contract: ${targetContract}`);
  console.log(`✓ GaslessProxy signer address: ${proxySignerAddress}`);
  
  // Summary
  console.log("\n🎉 Gasless Transaction System Deployed Successfully!");
  console.log("=".repeat(60));
  console.log(`ConfidentialReporter: ${reporterAddress}`);
  console.log(`GaslessProxy: ${proxyAddress}`);
  console.log(`GaslessSigner: ${signerAddress}`);
  console.log(`Gasless Signer Address: ${gaslessSignerAddress}`);
  console.log("=".repeat(60));
  
  // Save deployment info
  const deploymentInfo = {
    network: "sapphire_testnet",
    chainId: 23295,
    contracts: {
      ConfidentialReporter: {
        address: reporterAddress,
        gaslessEnabled: true
      },
      GaslessProxy: {
        address: proxyAddress,
        targetContract: reporterAddress,
        signerAddress: gaslessSignerAddress
      },
      GaslessSigner: {
        address: signerAddress,
        proxyContract: proxyAddress
      }
    },
    gaslessSignerAddress: gaslessSignerAddress,
    deployedAt: new Date().toISOString()
  };
  
  console.log("\nDeployment configuration:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});