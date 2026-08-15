/**
 * CompactUtils - Utility functions for Compact contract development
 *
 * @module @tawf/compact-contracts/lib
 */

// ============================================================================
// Hash Functions
// ============================================================================

/**
 * Simple hash of two field elements (placeholder for Poseidon)
 * TODO: Replace with actual Poseidon hash from Midnight SDK when available
 * @param a First field element
 * @param b Second field element
 * @returns Hash value
 */
export function hash2(a: bigint, b: bigint): bigint {
  // Simple placeholder hash - in production use actual Poseidon
  const data = BigInt.asUintN(64, a ^ b);
  const hash = BigInt.asUintN(64, data * 0x517cc1b727220a95n);
  return BigInt.asUintN(254, hash);
}

/**
 * Simple hash of three field elements (placeholder for Poseidon)
 * TODO: Replace with actual Poseidon hash from Midnight SDK when available
 * @param a First field element
 * @param b Second field element
 * @param c Third field element
 * @returns Hash value
 */
export function hash3(a: bigint, b: bigint, c: bigint): bigint {
  const combined = a ^ b ^ c;
  const hash = BigInt.asUintN(64, combined * 0x517cc1b727220a95n);
  return BigInt.asUintN(254, hash);
}

/**
 * Simple hash of four field elements (placeholder for Poseidon)
 * TODO: Replace with actual Poseidon hash from Midnight SDK when available
 * @param a First field element
 * @param b Second field element
 * @param c Third field element
 * @param d Fourth field element
 * @returns Hash value
 */
export function hash4(a: bigint, b: bigint, c: bigint, d: bigint): bigint {
  const combined = a ^ b ^ c ^ d;
  const hash = BigInt.asUintN(64, combined * 0x517cc1b727220a95n);
  return BigInt.asUintN(254, hash);
}

/**
 * Compute TID hash from components
 * @param owner Owner's public key
 * @param issuer Issuer's public key
 * @param timestamp Issuance timestamp
 * @returns TID hash
 */
export function computeTIDHash(
  owner: string,
  issuer: string,
  timestamp: number
): string {
  const ownerField = BigInt('0x' + owner.replace('0x', ''));
  const issuerField = BigInt('0x' + issuer.replace('0x', ''));
  const timestampField = BigInt(timestamp);

  const hash = hash3(ownerField, issuerField, timestampField);
  return '0x' + hash.toString(16).padStart(64, '0');
}

/**
 * Compute nullifier from components
 * @param tidHash Hash of the TID
 * @param daoId Identifier of the DAO
 * @param actionId Identifier of the specific action
 * @returns Nullifier value
 */
export function computeNullifier(
  tidHash: string,
  daoId: string,
  actionId: string
): string {
  const tidHashField = BigInt('0x' + tidHash.replace('0x', ''));
  const daoIdField = BigInt('0x' + daoId.replace('0x', ''));
  const actionIdField = BigInt('0x' + actionId.replace('0x', ''));
  const derivationKey = BigInt('0x' + '2718281828');

  const combined = hash3(tidHashField, daoIdField, actionIdField);
  const nullifier = hash2(combined, derivationKey);

  return '0x' + nullifier.toString(16).padStart(64, '0');
}

// ============================================================================
// Field Conversions
// ============================================================================

/**
 * Convert hex string to field element (bigint)
 * @param hex Hex string (with or without 0x prefix)
 * @returns Field element as bigint
 */
export function hexToField(hex: string): bigint {
  return BigInt('0x' + hex.replace('0x', ''));
}

/**
 * Convert field element to hex string
 * @param field Field element as bigint
 * @param padTo Length to pad to (default 64)
 * @returns Hex string with 0x prefix
 */
export function fieldToHex(field: bigint, padTo = 64): string {
  return '0x' + field.toString(16).padStart(padTo, '0');
}

/**
 * Convert string to field element
 * @param str Input string
 * @returns Field element as bigint
 */
export function stringToField(str: string): bigint {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  let hash = BigInt(0);
  for (let i = 0; i < data.length; i++) {
    hash = (hash << BigInt(8)) + BigInt(data[i]);
  }
  return hash;
}

/**
 * Convert number to field element
 * @param num Number to convert
 * @returns Field element as bigint
 */
export function numToField(num: number): bigint {
  return BigInt(num);
}

// ============================================================================
// Merkle Tree Utilities
// ============================================================================

/**
 * Compute Merkle root from leaves
 * @param leaves Array of leaf hashes
 * @returns Merkle root
 */
export function computeMerkleRoot(leaves: string[]): string {
  if (leaves.length === 0) {
    return '0x' + '0'.repeat(64);
  }

  if (leaves.length === 1) {
    return leaves[0];
  }

  let layer = leaves.map(leaf => BigInt('0x' + leaf.replace('0x', '')));

  while (layer.length > 1) {
    const newLayer: bigint[] = [];

    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = i + 1 < layer.length ? layer[i + 1] : BigInt(0);
      newLayer.push(hash2(left, right));
    }

    layer = newLayer;
  }

  return fieldToHex(layer[0]);
}

/**
 * Verify Merkle proof
 * @param leaf Leaf hash
 * @param proof Array of sibling hashes
 * @param indices Path indices (0 = left, 1 = right)
 * @param root Expected root
 * @returns true if proof is valid
 */
export function verifyMerkleProof(
  leaf: string,
  proof: string[],
  indices: number[],
  root: string
): boolean {
  let computed = BigInt('0x' + leaf.replace('0x', ''));

  for (let i = 0; i < proof.length; i++) {
    const sibling = BigInt('0x' + proof[i].replace('0x', ''));

    if (indices[i] === 0) {
      computed = hash2(computed, sibling);
    } else {
      computed = hash2(sibling, computed);
    }
  }

  const expectedRoot = BigInt('0x' + root.replace('0x', ''));
  return computed === expectedRoot;
}

/**
 * Generate Merkle proof for a leaf
 * @param leaves Array of all leaves
 * @param index Index of the leaf to prove
 * @returns Object with proof and indices
 */
export function generateMerkleProof(
  leaves: string[],
  index: number
): { proof: string[]; indices: number[] } {
  const proof: string[] = [];
  const indices: number[] = [];

  let layer = leaves.map(leaf => BigInt('0x' + leaf.replace('0x', '')));
  let currentIndex = index;

  while (layer.length > 1) {
    const isLeft = currentIndex % 2 === 0;
    const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1;

    if (siblingIndex < layer.length) {
      proof.push(fieldToHex(layer[siblingIndex]));
    }

    indices.push(isLeft ? 0 : 1);

    const newLayer: bigint[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = i + 1 < layer.length ? layer[i + 1] : BigInt(0);
      newLayer.push(hash2(left, right));
    }

    layer = newLayer;
    currentIndex = Math.floor(currentIndex / 2);
  }

  return { proof, indices };
}

// ============================================================================
// Proof Validation
// ============================================================================

/**
 * Validate proof freshness
 * @param proofTimestamp Proof creation timestamp
 * @param validityPeriod Validity period in seconds
 * @returns true if proof is still valid
 */
export function validateProofFreshness(
  proofTimestamp: number,
  validityPeriod: number
): boolean {
  const now = Math.floor(Date.now() / 1000);
  const expiry = proofTimestamp + validityPeriod;
  return expiry > now;
}

/**
 * Check if a value is within a range (inclusive)
 * @param value Value to check
 * @param min Minimum value
 * @param max Maximum value
 * @returns true if value is in range
 */
export function isInRange(value: bigint, min: bigint, max: bigint): boolean {
  return value >= min && value <= max;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Proof validity periods in seconds
 */
export const VALIDITY_PERIODS = {
  MUSTAHIK_ELIGIBILITY: 90 * 24 * 60 * 60, // 90 days
  MEMBERSHIP: 30 * 24 * 60 * 60, // 30 days
  CREDIT_RANGE: 7 * 24 * 60 * 60, // 7 days
  AGGREGATE_REPORT: 365 * 24 * 60 * 60, // 1 year
} as const;

/**
 * Nisab thresholds (example values - should be updated from oracle)
 */
export const NISAB_THRESHOLDS = {
  GOLD: BigInt('85' + '0'.repeat(18)), // 85 grams in wei units
  SILVER: BigInt('595' + '0'.repeat(18)), // 595 grams in wei units
} as const;

/**
 * Credential type values
 */
export const CREDENTIAL_TYPES = {
  MUSTAHIK: 0,
  AMIL: 1,
  MUZAKKI: 2,
  DAO_MEMBER: 3,
  FINANCE_USER: 4,
  VERIFIER: 5,
} as const;

/**
 * Eligibility status values
 */
export const ELIGIBILITY_STATUS = {
  UNVERIFIED: 0,
  ELIGIBLE: 1,
  INELIGIBLE: 2,
  REVOKED: 3,
  EXPIRED: 4,
} as const;
