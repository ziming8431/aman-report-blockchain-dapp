import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";
import confidentialReporterAbi from "~~/contracts/abis/ConfidentialReporter.json";

const deployedContracts = {
  23295: { // Chain ID for Oasis Sapphire Testnet
    ConfidentialReporter: {
      address: "0x66d35ae06318342Dd74b4F22A0B2E65Bc41f46a0", // Your deployed address
        abi: confidentialReporterAbi.abi,
    },
    },
} as const;

export default deployedContracts;