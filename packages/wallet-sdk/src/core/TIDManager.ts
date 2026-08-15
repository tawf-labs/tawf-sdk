/**
 * TIDManager - Main TID lifecycle management
 *
 * This class handles the complete lifecycle of TID credentials including:
 * - Requesting/minting new TIDs
 * - Generating zero-knowledge proofs
 * - Verifying TID status across chains
 * - Managing encrypted local storage
 *
 * @module @tawf/wallet-sdk/core
 */

import { EventEmitter } from 'eventemitter3';
import { MidnightConnector } from '../chains/midnight/connector';
import { EthereumConnector } from '../chains/ethereum/connector';
import { SolanaConnector } from '../chains/solana/connector';
import { EncryptedVault } from './Vault';
import { ProofEngine } from './ProofEngine';
import { DIDResolver } from './DIDResolver';
import type {
  TID,
  VerificationResult,
  MustahikProofData,
  MembershipProofData,
  ZKProof,
} from '@tawf/types';
import { Chain, CredentialType } from '@tawf/types';
import { ProofType } from '@tawf/types';

export interface TIDConfig {
  /** Midnight network configuration */
  midnight: {
    providerUrl: string;
    contractAddress: string;
  };
  /** Ethereum network configuration */
  ethereum?: {
    rpcUrl: string;
    anchorAddress?: string;
  };
  /** Base network configuration */
  base?: {
    rpcUrl: string;
    attestationAddress?: string;
  };
  /** Solana network configuration */
  solana?: {
    rpcUrl: string;
    programId?: string;
  };
  /** Vault encryption key */
  vault: {
    encryptionKey: string;
    storagePath: string;
  };
}

export interface TIDManagerEvents {
  /** Emitted when a TID is minted */
  minted: (tid: TID) => void;
  /** Emitted when a TID is revoked */
  revoked: (tidHash: string) => void;
  /** Emitted when a proof is generated */
  proofGenerated: (proof: ZKProof) => void;
  /** Emitted when verification completes */
  verified: (result: VerificationResult) => void;
  /** Emitted on error */
  error: (error: Error) => void;
}

/**
 * Main TID management class
 */
export class TIDManager extends EventEmitter {
  private midnightConnector: MidnightConnector;
  private ethereumConnector?: EthereumConnector;
  private solanaConnector?: SolanaConnector;
  private vault: EncryptedVault;
  private proofEngine: ProofEngine;
  private didResolver: DIDResolver;
  // @ts-expect-error - config stored for future use
  private _config: TIDConfig;

  constructor(config: TIDConfig) {
    super();

    this._config = config;
    this.midnightConnector = new MidnightConnector(config.midnight);
    this.vault = new EncryptedVault(config.vault);
    this.proofEngine = new ProofEngine();
    this.didResolver = new DIDResolver(config);

    if (config.ethereum) {
      this.ethereumConnector = new EthereumConnector(config.ethereum);
    }

    if (config.solana) {
      this.solanaConnector = new SolanaConnector(config.solana);
    }
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Initialize the TID Manager
   */
  async initialize(): Promise<void> {
    await this.vault.initialize();
    await this.midnightConnector.initialize();

    if (this.ethereumConnector) {
      await this.ethereumConnector.initialize();
    }

    if (this.solanaConnector) {
      await this.solanaConnector.initialize();
    }

    this.emit('initialized');
  }

  // ==========================================================================
  // TID Minting
  // ==========================================================================

  /**
   * Request TID minting with eligibility proof
   */
  async requestTID(
    credentialType: CredentialType,
    financialData?: MustahikProofData
  ): Promise<TID> {
    try {
      // 1. Get or create owner key
      const ownerKey = await this.vault.getOwnerKey();

      // 2. Generate ZK proof if financial data provided
      let proof: ZKProof | undefined;
      if (financialData && credentialType === CredentialType.MUSTAHIK) {
        proof = await this.generateEligibilityProof(financialData);
        this.emit('proofGenerated', proof);
      }

      // 3. Build metadata hash
      const metadataHash = this.buildMetadataHash(proof);

      // 4. Submit to Compact contract on Midnight
      const tid = await this.midnightConnector.mintTID({
        owner: ownerKey,
        credentialType,
        metadataHash,
        proof,
      });

      // 5. Store in encrypted local vault
      await this.vault.store(tid);

      this.emit('minted', tid);
      return tid;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Mint TID from existing credential (import)
   */
  async importTID(tid: TID): Promise<void> {
    await this.vault.store(tid);
    this.emit('minted', tid);
  }

  // ==========================================================================
  // Proof Generation
  // ==========================================================================

  /**
   * Generate Mustahik eligibility proof (client-side)
   */
  async generateEligibilityProof(
    privateData: MustahikProofData
  ): Promise<ZKProof> {
    const circuit = await this.proofEngine.load(ProofType.MUSTAHIK_ELIGIBILITY);

    const witness = {
      income: privateData.income,
      assets: privateData.assets,
      debts: privateData.debts,
      familySize: privateData.familySize,
    };

    const publicInputs = {
      nisabThreshold: await this.getNisabThreshold(),
      timestamp: Math.floor(Date.now() / 1000),
    };

    return circuit.execute(witness, publicInputs);
  }

  /**
   * Generate membership proof for DAO voting
   */
  async generateMembershipProof(
    daoId: string,
    actionId: string
  ): Promise<MembershipProofData> {
    const tid = await this.vault.getLatestTID();
    if (!tid) {
      throw new Error('No TID found. Please mint a TID first.');
    }

    const circuit = await this.proofEngine.load(ProofType.MEMBERSHIP);

    const nullifier = this.computeNullifier(tid.hash, daoId, actionId);

    await circuit.execute(
      { tidHash: tid.hash, ownerKey: tid.owner },
      { daoId, nullifier }
    );

    return {
      tidHash: tid.hash,
      ownerKey: tid.owner,
      daoId,
      nullifier,
      isMember: true,
    };
  }

  /**
   * Generate credit range proof for tawf.finance
   */
  async generateCreditProof(
    financialData: {
      creditScore: bigint;
      monthlyIncome: bigint;
      monthlyDebtPayment: bigint;
      totalDebt: bigint;
    }
  ): Promise<ZKProof> {
    const circuit = await this.proofEngine.load(ProofType.CREDIT_RANGE);

    return circuit.execute(financialData, {
      maxDTI: 5000, // 50% max DTI
      timestamp: Math.floor(Date.now() / 1000),
    });
  }

  // ==========================================================================
  // Verification
  // ==========================================================================

  /**
   * Verify TID status on any chain
   */
  async verifyTID(tidHash: string, chain: Chain): Promise<VerificationResult> {
    try {
      let result: VerificationResult;

      switch (chain) {
        case Chain.MIDNIGHT:
          result = await this.midnightConnector.verify(tidHash);
          break;
        case Chain.ETHEREUM:
        case Chain.BASE:
          if (!this.ethereumConnector) {
            throw new Error('Ethereum connector not configured');
          }
          result = await this.ethereumConnector.verify(tidHash, chain);
          break;
        case Chain.SOLANA:
          if (!this.solanaConnector) {
            throw new Error('Solana connector not configured');
          }
          result = await this.solanaConnector.verify(tidHash);
          break;
        default:
          throw new Error(`Unsupported chain: ${chain}`);
      }

      this.emit('verified', result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Verify TID across all chains
   */
  async verifyAcrossAllChains(tidHash: string): Promise<Map<Chain, VerificationResult>> {
    const results = new Map<Chain, VerificationResult>();

    // Verify on Midnight (source of truth)
    results.set(Chain.MIDNIGHT, await this.verifyTID(tidHash, Chain.MIDNIGHT));

    // Verify on Ethereum/Base if configured
    if (this.ethereumConnector) {
      results.set(Chain.ETHEREUM, await this.verifyTID(tidHash, Chain.ETHEREUM));
      results.set(Chain.BASE, await this.verifyTID(tidHash, Chain.BASE));
    }

    // Verify on Solana if configured
    if (this.solanaConnector) {
      results.set(Chain.SOLANA, await this.verifyTID(tidHash, Chain.SOLANA));
    }

    return results;
  }

  // ==========================================================================
  // DID Resolution
  // ==========================================================================

  /**
   * Resolve DID document
   */
  async resolveDID(did: string): Promise<any> {
    return this.didResolver.resolve(did);
  }

  /**
   * Get DID for a TID
   */
  getDID(tidHash: string): string {
    return `did:tawf:midnight:${tidHash}`;
  }

  // ==========================================================================
  // Local Storage
  // ==========================================================================

  /**
   * Get all stored TIDs
   */
  async getTIDs(): Promise<TID[]> {
    return this.vault.getAllTIDs();
  }

  /**
   * Get latest TID
   */
  async getLatestTID(): Promise<TID | null> {
    return this.vault.getLatestTID();
  }

  /**
   * Delete a TID from local storage
   */
  async deleteTID(tidHash: string): Promise<void> {
    await this.vault.delete(tidHash);
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  /**
   * Compute nullifier for double-spending prevention
   */
  private computeNullifier(tidHash: string, daoId: string, actionId: string): string {
    const data = `${tidHash}-${daoId}-${actionId}`;
    // In production, use proper cryptographic hash
    return btoa(data);
  }

  /**
   * Build metadata hash from proof
   */
  private buildMetadataHash(proof?: ZKProof): string {
    if (!proof) return '0x0';
    // Simple hash of proof data
    return btoa(JSON.stringify(proof.publicInputs));
  }

  /**
   * Get current nisab threshold from oracle/contract
   */
  private async getNisabThreshold(): Promise<bigint> {
    return this.midnightConnector.getNisabThreshold();
  }
}

export default TIDManager;
