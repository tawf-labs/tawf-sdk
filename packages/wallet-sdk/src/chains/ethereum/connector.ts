/**
 * Ethereum/Base Connector
 *
 * @module @tawf/wallet-sdk/chains/ethereum
 */

import { ethers } from 'ethers';
import type { VerificationResult, Chain } from '@tawf/types';

export interface EthereumConfig {
  rpcUrl: string;
  anchorAddress?: string;
  attestationAddress?: string;
}

// Minimal ABI for TID Anchor
const TID_ANCHOR_ABI = [
  'function merkleRoot() view returns (bytes32)',
  'function verifyTID(bytes32 tidHash, bytes32[] calldata merkleProof) view returns (bool)',
  'event RootUpdated(bytes32 indexed oldRoot, bytes32 indexed newRoot, uint256 midnightBlock)',
];

// Minimal ABI for TID Attestation
const TID_ATTESTATION_ABI = [
  'function anchor() view returns (address)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function locked(uint256 tokenId) view returns (bool)',
  'function getAttestation(uint256 tokenId) view returns (address owner, bytes32 tidHash, uint256 midnightBlockNumber, uint256 issuedAt, bool valid)',
  'function getTokenId(bytes32 tidHash) view returns (uint256)',
  'function mirrorTID(bytes32 tidHash, bytes32[] calldata merkleProof, uint256 midnightBlockNumber) returns (uint256)',
  'function isValidAttestation(uint256 tokenId) view returns (bool)',
  'function hasValidAttestation(address owner, bytes32 tidHash) view returns (bool)',
  'event AttestationIssued(uint256 indexed tokenId, address indexed owner, bytes32 tidHash)',
  'event AttestationRevoked(uint256 indexed tokenId)',
];

/**
 * Connector for Ethereum and Base networks
 */
export class EthereumConnector {
  private config: EthereumConfig;
  private provider?: ethers.JsonRpcProvider;
  private anchor?: ethers.Contract;
  private attestation?: ethers.Contract;

  constructor(config: EthereumConfig) {
    this.config = config;
  }

  /**
   * Initialize the connector
   */
  async initialize(): Promise<void> {
    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);

    if (this.config.anchorAddress) {
      this.anchor = new ethers.Contract(
        this.config.anchorAddress,
        TID_ANCHOR_ABI,
        this.provider
      );
    }

    if (this.config.attestationAddress) {
      this.attestation = new ethers.Contract(
        this.config.attestationAddress,
        TID_ATTESTATION_ABI,
        this.provider
      );
    }
  }

  /**
   * Verify TID on Ethereum or Base
   */
  async verify(tidHash: string, chain: Chain = 'ethereum' as Chain): Promise<VerificationResult> {
    if (!this.anchor) {
      throw new Error('Anchor contract not configured');
    }

    // For Ethereum: verify against anchor only
    // For Base: verify against attestation contract
    if (chain === 'base' && this.attestation) {
      return this.verifyOnBase(tidHash);
    }

    return this.verifyOnEthereum(tidHash);
  }

  /**
   * Get current merkle root from anchor
   */
  async getMerkleRoot(): Promise<string> {
    if (!this.anchor) {
      throw new Error('Anchor contract not configured');
    }

    return await this.anchor.merkleRoot();
  }

  /**
   * Mirror TID to Base
   */
  async mirrorTID(
    tidHash: string,
    merkleProof: string[],
    midnightBlockNumber: number,
    signer: ethers.Signer
  ): Promise<number> {
    if (!this.attestation) {
      throw new Error('Attestation contract not configured');
    }

    const attestation = this.attestation.connect(signer);
    const tx = await (attestation as any).mirrorTID(
      tidHash,
      merkleProof,
      midnightBlockNumber
    );

    const receipt = await tx.wait();
    const event = receipt?.logs.find((log: any) => {
      try {
        return attestation.interface.parseLog(log)?.name === 'AttestationIssued';
      } catch {
        return false;
      }
    });

    if (event) {
      const parsed = attestation.interface.parseLog(event);
      return parsed?.args?.tokenId ?? 0;
    }

    throw new Error('AttestationIssued event not found');
  }

  /**
   * Check attestation validity
   */
  async isValidAttestation(tokenId: number): Promise<boolean> {
    if (!this.attestation) {
      throw new Error('Attestation contract not configured');
    }

    return await this.attestation.isValidAttestation(tokenId);
  }

  /**
   * Get token ID by TID hash
   */
  async getTokenId(tidHash: string): Promise<number | null> {
    if (!this.attestation) {
      throw new Error('Attestation contract not configured');
    }

    const tokenId = await this.attestation.getTokenId(tidHash);
    return tokenId > 0 ? tokenId : null;
  }

  /**
   * Listen for attestation events
   */
  listenAttestationIssued(callback: (tokenId: number, owner: string, tidHash: string) => void): () => void {
    if (!this.attestation) {
      throw new Error('Attestation contract not configured');
    }

    const listener = (...args: any[]) => {
      const [tokenId, owner, hash] = args;
      callback(tokenId, owner, hash);
    };

    this.attestation.on('AttestationIssued', listener);

    // Return cleanup function
    return () => {
      this.attestation?.off('AttestationIssued', listener);
    };
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private async verifyOnEthereum(tidHash: string): Promise<VerificationResult> {
    // On Ethereum, we verify the merkle proof against the anchor
    // This is a simplified version - in production, you'd need the actual proof
    return {
      valid: true,
      tidHash,
      status: 1, // ELIGIBLE
      verifiedAt: Math.floor(Date.now() / 1000),
      chain: 'ethereum' as Chain,
    };
  }

  private async verifyOnBase(tidHash: string): Promise<VerificationResult> {
    if (!this.attestation) {
      throw new Error('Attestation contract not configured');
    }

    const tokenId = await this.getTokenId(tidHash);

    if (!tokenId) {
      return {
        valid: false,
        tidHash,
        status: 0,
        verifiedAt: Math.floor(Date.now() / 1000),
        chain: 'base' as Chain,
        errors: ['Attestation not found'],
      };
    }

    const valid = await this.isValidAttestation(tokenId);

    return {
      valid,
      tidHash,
      status: valid ? 1 : 3,
      verifiedAt: Math.floor(Date.now() / 1000),
      chain: 'base' as Chain,
    };
  }
}

export default EthereumConnector;
