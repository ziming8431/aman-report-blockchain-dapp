# Sp3akUP: A Confidential Reporting DApp

Sp3akUP is a decentralized application (DApp) that empowers users to submit confidential reports securely and anonymously. Built on the Oasis Sapphire confidential EVM, it ensures that all data, from submission to storage, remains encrypted and accessible only to authorized parties.

## 🌟 Key Features

- **🔒 End-to-End Encryption**: Leverages the Oasis Sapphire network to provide confidentiality for all transactions and smart contract states.
- **🤫 Anonymous Reporting**: Users can submit reports without revealing their identities, thanks to gasless transactions and robust privacy features.
- **🔐 Fine-Grained Access Control**: Report owners can grant specific access permissions to trusted third parties, such as legal advisors or counselors.
- **⛽ Gasless Transactions**: A relayer-based system allows users to submit reports without needing native tokens for gas fees, lowering the barrier to entry.
- **🔗 Smart Contract Integration**: Core logic is managed by a `ConfidentialReporter` smart contract, ensuring transparency and immutability.
- **🎨 Modern Frontend**: A sleek and intuitive user interface built with Next.js, TypeScript, and Tailwind CSS for a seamless user experience.
- **📊 Engaging UI Components**: Includes dynamic elements like a live activity feed, trending topics, and quick stats to enhance user engagement.

## 🛠️ Technology Stack

- **Blockchain**: Oasis Sapphire (Confidential EVM)
- **Smart Contracts**: Solidity, Hardhat
- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Web3 Libraries**: Ethers.js, Wagmi, RainbowKit
- **Encryption**: x25519-deoxysII (via Oasis Sapphire)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ziming8431/aman-report-blockchain-dapp.git
    ```

2.  **Install contract dependencies:**
    ```bash
    cd aman-report-contract
    yarn install
    npm hardhat --save-dev typescript
    npm hardhat --save-dev ts-node
    ```
    (+) Add .env file and add your wallet Private Key along with this Sapphire Testnet Url
    ```
    PRIVATE_KEY= <your private key not public one>
    SAPPHIRE_TESTNET_URL=https://testnet.sapphire.oasis.io
    SAPPHIRE_TESTNET_CHAIN_ID=23295
    ```
    Then deploy your Smart Contract
    ```
    npx hardhat run scripts/deploy.ts --network sapphire_testnet
    ```

4.  **Install DApp dependencies:**
    ```bash
    cd ../aman-report-dapp
    yarn install
    ```

### Development

#### Smart Contracts

From the `aman-report-contract` directory:

- **Compile:** `npx hardhat compile`
- **Deploy:** `npx hardhat run scripts/deploy.ts --network sapphire_testnet`

#### Frontend DApp

From the `aman-report-dapp` directory:

- **Start development server:** `yarn start`

The DApp will be accessible at `http://localhost:3000`.

## 🔐 Security and Encryption

Sp3akUP is designed with security as a top priority. Here’s how we protect your data:

- **Confidential Transactions**: All data sent to the `ConfidentialReporter` smart contract is encrypted by default on the Oasis Sapphire network.
- **Encrypted State**: The state of the smart contract, including all report data, is kept confidential.
- **Access Control**: The `onlyAuthorized` modifier in the smart contract ensures that only the report owner or a designated delegate can access the report's contents.
- **Digital Signatures**: ECDSA signatures are used to verify the authenticity of messages and actions within the system.

## 🤝 Contributing

We welcome contributions from the community! Please read our `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

