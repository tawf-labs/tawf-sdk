/**
 * @tawf/wallet-sdk - React Native SDK for Tawf DID Protocol
 *
 * @packageDocumentation
 */

// Core exports
export * from './core';

// Chain exports
export * from './chains';

// Circuit exports
export * from './circuits';

// Type exports
export type {
  TID,
  TIDHash,
  TIDOwner,
  TIDIssuer,
  TIDDID,
  TIDMintResult,
  VerificationResult,
  TIDMetadata,
} from '@tawf/types';

export type {
  ZKProof,
  MustahikProofData,
  MembershipProofData,
} from '@tawf/types';

export type {
  Chain,
  CredentialType,
  EligibilityStatus,
} from '@tawf/types';

// Default export
export { TIDManager as default } from './core/TIDManager';

/**
 * SDK version
 */
export const VERSION = '1.0.0';

/**
 * Create a new TID Manager instance
 */
export function createTIDManager(config: import('./core/TIDManager').TIDConfig) {
  // Dynamic import to avoid circular dependency
  const { TIDManager } = require('./core/TIDManager');
  return new TIDManager(config);
}
