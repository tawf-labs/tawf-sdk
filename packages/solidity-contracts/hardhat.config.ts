import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'hardhat-deploy';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: 'cancun',
    },
  },
  networks: {
    'ethereum-mainnet': {
      url: process.env.ETHEREUM_RPC_URL || '',
      chainId: 1,
      accounts: process.env.ETHEREUM_PRIVATE_KEY ? [process.env.ETHEREUM_PRIVATE_KEY] : [],
    },
    'ethereum-testnet': {
      url: process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY',
      chainId: 11155111,
      accounts: process.env.ETHEREUM_PRIVATE_KEY ? [process.env.ETHEREUM_PRIVATE_KEY] : [],
    },
    'base-mainnet': {
      url: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      chainId: 8453,
      accounts: process.env.BASE_PRIVATE_KEY ? [process.env.BASE_PRIVATE_KEY] : [],
    },
    'base-testnet': {
      url: process.env.BASE_RPC_URL || 'https://sepolia.base.org',
      chainId: 84532,
      accounts: process.env.BASE_PRIVATE_KEY ? [process.env.BASE_PRIVATE_KEY] : [],
    },
    hardhat: {
      chainId: 31337,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || '',
      sepolia: process.env.ETHERSCAN_API_KEY || '',
      base: process.env.BASESCAN_API_KEY || '',
      'base-sepolia': process.env.BASESCAN_API_KEY || '',
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    guardian: {
      default: 1,
    },
  },
};

export default config;
