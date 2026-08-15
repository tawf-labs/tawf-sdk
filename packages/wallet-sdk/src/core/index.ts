/**
 * @tawf/wallet-sdk/core - Core SDK functionality
 */

export { TIDManager } from './TIDManager';
export { ProofEngine } from './ProofEngine';
export { EncryptedVault } from './Vault';
export { DIDResolver } from './DIDResolver';

export type { TIDConfig, TIDManagerEvents } from './TIDManager';
export type { CircuitConfig } from './ProofEngine';
export type { VaultConfig } from './Vault';
export type { DIDDocument, VerificationMethod, ServiceEndpoint } from './DIDResolver';
