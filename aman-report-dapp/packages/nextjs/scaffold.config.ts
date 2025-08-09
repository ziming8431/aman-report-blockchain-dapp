import { defineChain } from "viem";

export const sapphireTestnet = defineChain({
  id: 23295,
  name: "Oasis Sapphire Testnet",
  nativeCurrency: { name: "Sapphire Test Rose", symbol: "TEST", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.sapphire.oasis.io"] },
  },
  blockExplorers: {
    default: { name: "Oasis Sapphire Testnet Explorer", url: "https://testnet.explorer.sapphire.oasis.io" },
  },
});

export const scaffoldConfig = {
  targetNetworks: [sapphireTestnet],
  pollingInterval: 30000,
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",
  onlyLocalBurnerWallet: true,
  walletAutoConnect: true,
} as const;

export default scaffoldConfig;
