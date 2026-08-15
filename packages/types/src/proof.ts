/**
 * Zero-Knowledge Proof type definitions
 */

import { TIDHash } from './tid';

/**
 * Supported ZK proof systems
 */
export enum ProofSystem {
  GROTH16 = 'groth16',
  PLONK = 'plonk',
  HONK = 'honk',
  COMPACT_ZK = 'compact-zk',
}

/**
 * Proof types for different circuits
 */
export enum ProofType {
  MUSTAHIK_ELIGIBILITY = 'mustahik_eligibility',
  MEMBERSHIP = 'membership',
  CREDIT_RANGE = 'credit_range',
  AGGREGATE_REPORT = 'aggregate_report',
}

/**
 * Generic ZK proof structure
 */
export interface ZKProof {
  /** Type of proof/circuit */
  type: ProofType;
  /** Proof system used */
  system: ProofSystem;
  /** Serialized proof data (base64 or hex) */
  proofData: string;
  /** Public inputs for verification */
  publicInputs: Record<string, unknown>;
  /** Proof generation timestamp */
  timestamp: number;
  /** Proof validity period */
  validUntil: number;
}

/**
 * Groth16 proof structure
 */
export interface Groth16Proof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  publicInputs: string[];
  protocol: ProofSystem.GROTH16;
}

/**
 * Compact-specific proof structure
 */
export interface CompactProof {
  /** Circuit identifier */
  circuitId: string;
  /** Proof commitment */
  commitment: string;
  /** Public outputs */
  publicOutputs: Record<string, unknown>;
  /** Proof verification key reference */
  vkHash: string;
}

/**
 * Mustahik eligibility proof specific inputs/outputs
 */
export interface MustahikProofData {
  /** Private: User's income */
  income: bigint;
  /** Private: User's assets */
  assets: bigint;
  /** Private: User's debts */
  debts: bigint;
  /** Private: Family size */
  familySize: number;
  /** Public: Nisab threshold for comparison */
  nisabThreshold: bigint;
  /** Public: Proof timestamp */
  timestamp: number;
  /** Output: Computed net wealth commitment */
  netWealthCommitment: string;
}

/**
 * Membership proof for DAO voting
 */
export interface MembershipProofData {
  /** Private: TID hash */
  tidHash: TIDHash;
  /** Private: Owner's signing key */
  ownerKey: string;
  /** Public: DAO identifier */
  daoId: string;
  /** Public: Nullifier to prevent double-voting */
  nullifier: string;
  /** Output: Valid member flag */
  isMember: boolean;
}

/**
 * Credit range proof for tawf.finance
 */
export interface CreditRangeProofData {
  /** Private: Credit score */
  creditScore: bigint;
  /** Private: Income */
  income: bigint;
  /** Private: Existing debt */
  existingDebt: bigint;
  /** Public: Minimum credit score required */
  minCreditScore: bigint;
  /** Public: Maximum debt-to-income ratio (basis points) */
  maxDTI: bigint;
  /** Output: Approved credit tier */
  creditTier: number;
}

/**
 * Aggregated report proof for BAZNAS
 */
export interface AggregateReportProofData {
  /** Total zakat collected */
  totalCollected: bigint;
  /** Total mustahik served */
  totalMustahik: number;
  /** Distribution by category */
  distribution: {
    category: string;
    amount: bigint;
    recipients: number;
  }[];
  /** Merkle root of individual records */
  recordsRoot: string;
  /** Report period (month/year) */
  period: string;
}

/**
 * Proof verification request
 */
export interface ProofVerifyRequest {
  proof: ZKProof;
  circuitId: string;
  verificationKey?: string;
}

/**
 * Proof verification result
 */
export interface ProofVerifyResult {
  valid: boolean;
  proofType: ProofType;
  verifiedAt: number;
  error?: string;
}
