import { ZKProof } from './proof';

/**
 * Core TID (Tawf ID) type definitions
 * Represents the soulbound ZK-DID identity credential
 */

/**
 * Unique identifier for a TID credential
 * Format: hash(owner, issuer, timestamp)
 */
export type TIDHash = string;

/**
 * Public key or address of the TID owner
 */
export type TIDOwner = string;

/**
 * Public key or address of the TID issuer
 */
export type TIDIssuer = string;

/**
 * DID identifier using the did:tawf method
 * Format: did:tawf:{midnight-address}:{identifier}
 */
export type TIDDID = string;

/**
 * Supported credential types
 */
export enum CredentialType {
  MUSTAHIK = 0, // Zakat recipient eligibility
  AMIL = 1, // Zakat collector
  MUZAKKI = 2, // Zakat payer
  DAO_MEMBER = 3, // DAO governance participant
  FINANCE_USER = 4, // tawf.finance user
  VERIFIER = 5, // Authorized verifier
}

/**
 * Current status of a TID credential
 */
export enum EligibilityStatus {
  UNVERIFIED = 0,
  ELIGIBLE = 1,
  INELIGIBLE = 2,
  REVOKED = 3,
  EXPIRED = 4,
}

/**
 * Supported blockchain networks
 */
export enum Chain {
  MIDNIGHT = 'midnight',
  ETHEREUM = 'ethereum',
  BASE = 'base',
  SOLANA = 'solana',
}

/**
 * Core TID structure
 */
export interface TID {
  /** Unique hash identifier */
  hash: TIDHash;
  /** Owner's public key/address */
  owner: TIDOwner;
  /** Issuer's public key/address */
  issuer: TIDIssuer;
  /** Unix timestamp of issuance */
  issuedAt: number;
  /** Type of credential */
  credentialType: CredentialType;
  /** Hash of metadata (e.g., financial proof commitments) */
  metadataHash: string;
  /** Current verification status */
  status: EligibilityStatus;
  /** Expiration timestamp (0 = no expiration) */
  expiresAt: number;
  /** DID identifier */
  did: TIDDID;
}

/**
 * TID creation parameters
 */
export interface TIDCreateParams {
  owner: TIDOwner;
  credentialType: CredentialType;
  metadataHash: string;
  expiresAt?: number;
}

/**
 * TID minting transaction result
 */
export interface TIDMintResult {
  tid: TID;
  transactionHash: string;
  blockNumber: number;
  chain: Chain;
}

/**
 * TID verification result
 */
export interface VerificationResult {
  valid: boolean;
  tidHash: TIDHash;
  status: EligibilityStatus;
  verifiedAt: number;
  chain: Chain;
  proof?: ZKProof;
  errors?: string[];
}

/**
 * Metadata attached to TID credentials
 */
export interface TIDMetadata {
  /** Country code (ISO 3166-1 alpha-2) */
  country?: string;
  /** Regional identifier */
  region?: string;
  /** Optional name commitments (hash, not plaintext) */
  nameHash?: string;
  /** Organization/institution */
  organization?: string;
  /** Additional attributes */
  attributes?: Record<string, string>;
}

/**
 * Revocation information
 */
export interface RevocationInfo {
  tidHash: TIDHash;
  revokedAt: number;
  revokedBy: TIDIssuer;
  reason: string;
}
