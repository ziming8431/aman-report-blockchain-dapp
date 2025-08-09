import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// This line is crucial! It imports the Oasis Sapphire plugin.
// It must be the first import of this type.
import "@oasisprotocol/sapphire-hardhat";

// This is to load your private key for deployment from a .env file
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    // Configuration for the Oasis Sapphire Testnet
    sapphire_testnet: {
      url: "https://testnet.sapphire.oasis.dev",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 23295, // Official Chain ID for Sapphire Testnet
    },
  },
  // This addition disables the gas reporter to prevent the Windows-specific error.
  gasReporter: {
    enabled: false,
  },
};
module.exports = {
  sourcify: {
    // Doesn't need an API key
    enabled: true
  }
};

export default config;