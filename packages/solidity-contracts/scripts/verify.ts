/**
 * Verification script for deployed contracts
 */

import hre from 'hardhat';

async function main() {
  const anchorAddress = process.env.ANCHOR_ADDRESS;
  const attestationAddress = process.env.ATTESTATION_ADDRESS;

  if (!anchorAddress && !attestationAddress) {
    console.error('Please set ANCHOR_ADDRESS or ATTESTATION_ADDRESS');
    process.exit(1);
  }

  // Verify Anchor
  if (anchorAddress) {
    console.log('\nVerifying TIDAnchor at', anchorAddress);
    const Anchor = await hre.ethers.getContractFactory('TIDAnchor');
    const anchor = Anchor.attach(anchorAddress);

    const root = await anchor.merkleRoot();
    const threshold = await anchor.signatureThreshold();
    const nonce = await anchor.nonce();

    console.log('Merkle Root:', root);
    console.log('Signature Threshold:', threshold.toString());
    console.log('Nonce:', nonce.toString());
  }

  // Verify Attestation
  if (attestationAddress) {
    console.log('\nVerifying TIDAttestation at', attestationAddress);
    const Attestation = await hre.ethers.getContractFactory('TIDAttestation');
    const attestation = Attestation.attach(attestationAddress);

    const anchor = await attestation.anchor();
    const name = await attestation.name();
    const symbol = await attestation.symbol();
    const total = await attestation.totalAttestations();

    console.log('Anchor Address:', anchor);
    console.log('Name:', name);
    console.log('Symbol:', symbol);
    console.log('Total Attestations:', total.toString());
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
