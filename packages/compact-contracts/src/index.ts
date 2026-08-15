/**
 * @tawf/compact-contracts - Midnight Network Compact smart contracts
 *
 * This package contains all Compact smart contracts for the Tawf DID Protocol.
 *
 * @packageDocumentation
 */

// Export contract utilities
export * from './lib';

// Re-export commonly used types
import type {
  TIDHash,
  TIDOwner,
  CredentialType,
  EligibilityStatus,
  Chain,
} from '@tawf/types';

export type {
  TIDHash,
  TIDOwner,
  CredentialType,
  EligibilityStatus,
  Chain,
};

/**
 * Contract addresses on different networks
 */
export const CONTRACT_ADDRESSES = {
  midnight: {
    testnet: '0x0000000000000000000000000000000000000000',
    mainnet: '0x0000000000000000000000000000000000000000',
  },
} as const;

/**
 * Default configuration for contract deployment
 */
export const DEFAULT_CONFIG = {
  // Proof validity period in seconds
  proofValidityPeriod: 90 * 24 * 60 * 60, // 90 days

  // Gas limits
  gasLimits: {
    mint: 500000,
    verify: 300000,
    revoke: 200000,
  },

  // Confirmation blocks
  confirmations: {
    testnet: 1,
    mainnet: 6,
  },
} as const;
