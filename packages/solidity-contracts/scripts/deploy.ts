/**
 * Deployment scripts for TID Anchor and Attestation contracts
 */

import type { HardhatRuntimeEnvironment } from 'hardhat/types';
import type { DeployFunction } from 'hardhat-deploy/types';

const deployEthereum: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer, guardian: _guardian } = await getNamedAccounts();

  console.log(`\nDeploying to ${network.name}...`);
  console.log('Deployer:', deployer);
  console.log('Guardian:', _guardian);

  // Get guardians from config or environment
  const guardians = [
    _guardian,
    ...(process.env.ADDITIONAL_GUARDIANS?.split(',') || []),
  ];

  const signatureThreshold = parseInt(process.env.SIGNATURE_THRESHOLD || '1');
  const initialRoot = process.env.INITIAL_MERKLE_ROOT || hre.ethers.ZeroHash;

  // Deploy TID Anchor
  const anchor = await deploy('TIDAnchor', {
    from: deployer,
    args: [guardians, signatureThreshold, initialRoot],
    log: true,
    waitConfirmations: network.name === 'hardhat' ? 1 : 3,
  });

  console.log(`TIDAnchor deployed to: ${anchor.address}`);

  // Verify on Etherscan if not on hardhat
  if (network.name !== 'hardhat' && process.env.ETHERSCAN_API_KEY) {
    console.log('Waiting for block confirmations...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
      await hre.run('verify:verify', {
        address: anchor.address,
        constructorArguments: [guardians, signatureThreshold, initialRoot],
      });
    } catch (error) {
      console.error('Verification failed:', error);
    }
  }
};

const deployBase: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer, guardian: _guardian } = await getNamedAccounts();

  console.log(`\nDeploying to ${network.name}...`);

  // Get anchor address
  const anchorAddress = process.env.ANCHOR_ADDRESS;
  if (!anchorAddress) {
    throw new Error('ANCHOR_ADDRESS environment variable required');
  }

  const tokenName = 'Tawf ID Attestation';
  const tokenSymbol = 'TID-SBT';
  const baseURI = process.env.BASE_URI || 'https://api.tawf.foundation/metadata/tid/';

  // Deploy TID Attestation
  const attestation = await deploy('TIDAttestation', {
    from: deployer,
    args: [anchorAddress, tokenName, tokenSymbol, baseURI],
    log: true,
    waitConfirmations: network.name === 'hardhat' ? 1 : 3,
  });

  console.log(`TIDAttestation deployed to: ${attestation.address}`);

  // Verify on Etherscan/Basescan if not on hardhat
  if (network.name !== 'hardhat' && process.env.BASESCAN_API_KEY) {
    console.log('Waiting for block confirmations...');
    await new Promise(() => setTimeout(() => {}, 30000));

    try {
      await hre.run('verify:verify', {
        address: attestation.address,
        constructorArguments: [anchorAddress, tokenName, tokenSymbol, baseURI],
      });
    } catch (error) {
      console.error('Verification failed:', error);
    }
  }
};

// Tag-based deployment
deployEthereum.tags = ['ethereum', 'anchor'];
deployBase.tags = ['base', 'attestation'];

export default deployEthereum;
export { deployBase };
