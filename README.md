# Aman Report Project

A decentralized application for confidential reporting built with Scaffold-ETH 2.

## Project Structure

This is a monorepo containing:

- `aman-report-contract/` - Smart contracts built with Hardhat
- `aman-report-dapp/` - Frontend DApp built with Next.js and Scaffold-ETH 2
- `Devmatch2025/` - Additional project files

## Getting Started

### Prerequisites

- Node.js >= 18
- Yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd AmanReport
```

2. Install dependencies for the contract:
```bash
cd aman-report-contract
yarn install
```

3. Install dependencies for the dapp:
```bash
cd ../aman-report-dapp
yarn install
```

### Development

#### Smart Contracts

```bash
cd aman-report-contract
yarn compile
yarn test
yarn deploy
```

#### Frontend DApp

```bash
cd aman-report-dapp
yarn start
```

## Features

- Confidential reporting system
- Smart contract integration
- Modern React frontend
- TypeScript support
- Hardhat development environment

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
