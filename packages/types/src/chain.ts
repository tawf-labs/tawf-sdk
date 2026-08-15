/**
 * Cross-chain type definitions
 */

import { Chain } from './tid';

/**
 * Transaction hash across different chains
 */
export type TxHash = string;

/**
 * Block number
 */
export type BlockNumber = number;

/**
 * Merkle proof structure
 */
export interface MerkleProof {
  /** Leaf node hash */
  leaf: string;
  /** Sibling hashes */
  siblings: string[];
  /** Path indices (0 = left, 1 = right) */
  indices: number[];
  /** Root hash */
  root: string;
}

/**
 * Cross-chain message types
 */
export enum MessageType {
  TID_MINTED = 'tid_minted',
  TID_REVOKED = 'tid_revoked',
  MERKLE_ROOT_UPDATED = 'merkle_root_updated',
  ATTESTATION_CREATED = 'attestation_created',
  ATTESTATION_REVOKED = 'attestation_revoked',
}

/**
 * Cross-chain message header
 */
export interface MessageHeader {
  /** Source chain */
  sourceChain: Chain;
  /** Destination chain */
  destinationChain: Chain;
  /** Message nonce */
  nonce: number;
  /** Timestamp */
  timestamp: number;
  /** Message type */
  type: MessageType;
}

/**
 * Cross-chain message payload
 */
export interface CrossChainMessage {
  header: MessageHeader;
  /** Encoded payload data */
  payload: string;
  /** Signatures from relayers */
  signatures: string[];
}

/**
 * TID minted event data
 */
export interface TIDMintedEvent {
  tidHash: string;
  owner: string;
  issuer: string;
  credentialType: number;
  metadataHash: string;
  blockNumber: BlockNumber;
  timestamp: number;
}

/**
 * TID revoked event data
 */
export interface TIDRevokedEvent {
  tidHash: string;
  revokedBy: string;
  reason: string;
  blockNumber: BlockNumber;
  timestamp: number;
}

/**
 * Merkle root update event
 */
export interface RootUpdateEvent {
  oldRoot: string;
  newRoot: string;
  midnightBlockNumber: BlockNumber;
  timestamp: number;
}

/**
 * Attestation mirror event
 */
export interface AttestationEvent {
  tokenId: number;
  owner: string;
  tidHash: string;
  midnightBlockNumber: BlockNumber;
  chain: Chain;
}

/**
 * Bridge relayer configuration
 */
export interface RelayerConfig {
  /** Chain ID */
  chainId: number | string;
  /** RPC URL */
  rpcUrl: string;
  /** WebSocket URL for events */
  wsUrl?: string;
  /** Private key for signing */
  privateKey?: string;
  /** Contract addresses */
  contracts: {
    tidAnchor?: string;
    tidAttestation?: string;
    tidProgram?: string;
  };
  /** Confirmation blocks */
  confirmationBlocks: number;
}

/**
 * Midnight network configuration
 */
export interface MidnightConfig {
  /** Midnight provider URL */
  providerUrl: string;
  /** TID contract address */
  contractAddress: string;
  /** Polling interval in milliseconds */
  pollingInterval?: number;
}

/**
 * EVM chain configuration for bridge relayer
 */
export interface EVMChainConfig {
  /** RPC URL */
  rpcUrl: string;
  /** WebSocket URL for events */
  wsUrl?: string;
  /** Contract address */
  contractAddress: string;
  /** Chain ID */
  chainId?: number;
}

/**
 * Solana configuration for bridge relayer
 */
export interface SolanaConfig {
  /** RPC URL */
  rpcUrl: string;
  /** WebSocket URL for events */
  wsUrl?: string;
  /** Program ID */
  programId: string;
}

/**
 * Bridge relayer service configuration
 */
export interface BridgeRelayerConfig {
  /** Midnight network configuration */
  midnight: MidnightConfig;
  /** Ethereum configuration (optional) */
  ethereum?: EVMChainConfig;
  /** Base configuration (optional) */
  base?: EVMChainConfig;
  /** Solana configuration (optional) */
  solana?: SolanaConfig;
}

/**
 * Guardian signature for multi-sig operations
 */
export interface GuardianSignature {
  /** Guardian address */
  guardian: string;
  /** Signature data */
  signature: string;
  /** Signature index */
  index: number;
}

/**
 * Multi-sig threshold configuration
 */
export interface MultiSigConfig {
  /** List of guardian addresses */
  guardians: string[];
  /** Required signatures */
  threshold: number;
  /** Signature type (ECDSA, BLS, EdDSA) */
  signatureType: 'ECDSA' | 'BLS' | 'EdDSA';
}

/**
 * Chain-specific configuration
 */
export interface ChainConfig {
  chain: Chain;
  chainId: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: string;
    fallback?: string;
  };
  blockExplorer: string;
  contracts: {
    tidAnchor?: string;
    tidAttestation?: string;
  };
}

/**
 * State sync status
 */
export interface SyncStatus {
  lastSyncedBlock: BlockNumber;
  latestBlock: BlockNumber;
  syncPercentage: number;
  isSyncing: boolean;
  error?: string;
}

/**
 * Bridge transaction status
 */
export interface BridgeTxStatus {
  sourceTxHash: TxHash;
  sourceChain: Chain;
  destinationChain: Chain;
  status: 'pending' | 'confirmed' | 'relayed' | 'failed';
  relayTxHash?: TxHash;
  error?: string;
}
