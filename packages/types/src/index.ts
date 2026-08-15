/**
 * @tawf/types - Shared TypeScript types for Tawf DID Protocol
 */

// Export all type modules
export * from './tid';
export * from './proof';
export * from './chain';

// Re-export commonly used types at root level
export type {
  TID,
  TIDHash,
  TIDOwner,
  TIDIssuer,
  TIDDID,
  TIDMintResult,
  VerificationResult,
  TIDMetadata,
} from './tid';

export type {
  ZKProof,
  Groth16Proof,
  CompactProof,
  MustahikProofData,
  MembershipProofData,
  ProofVerifyResult,
} from './proof';

export type {
  MerkleProof,
  CrossChainMessage,
  TIDMintedEvent,
  TIDRevokedEvent,
  RootUpdateEvent,
  ChainConfig,
  RelayerConfig,
  BridgeRelayerConfig,
  MidnightConfig,
  EVMChainConfig,
  SolanaConfig,
} from './chain';
