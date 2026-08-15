/**
 * Type extensions for hardhat-deploy plugin and hardhat-ethers
 * Adds deployments, getNamedAccounts, and ethers to HardhatRuntimeEnvironment
 */

import 'hardhat-deploy';
import { ethers } from 'ethers';
import { HardhatEthersHelpers } from '@nomicfoundation/hardhat-ethers/types';

declare module 'hardhat/types' {
  interface HardhatRuntimeEnvironment {
    deployments: any;
    getNamedAccounts(): Promise<{ [name: string]: string }>;
    ethers: typeof ethers & HardhatEthersHelpers;
  }
}
