/**
 * @tawf/wallet-sdk/circuits - Circuit wrappers and helpers
 */

import type {
  MustahikProofData,
  MembershipProofData,
  ZKProof,
} from '@tawf/types';

/**
 * Circuit wrapper for Mustahik eligibility
 */
export class MustahikCircuit {
  /**
   * Prepare witness data for proof generation
   */
  static prepareWitness(data: {
    income: number | bigint;
    assets: number | bigint;
    debts: number | bigint;
    familySize: number;
    nisabThreshold?: bigint;
  }): MustahikProofData {
    const nisabThreshold = data.nisabThreshold || BigInt('50000000000');
    const timestamp = Math.floor(Date.now() / 1000);
    // In production, compute actual cryptographic commitment
    const netWealthCommitment = `0x${BigInt(data.income) + BigInt(data.assets) - BigInt(data.debts)}`;

    return {
      income: BigInt(data.income),
      assets: BigInt(data.assets),
      debts: BigInt(data.debts),
      familySize: data.familySize,
      nisabThreshold,
      timestamp,
      netWealthCommitment,
    };
  }

  /**
   * Verify proof is still valid
   */
  static verifyProofFreshness(proof: ZKProof): boolean {
    const now = Math.floor(Date.now() / 1000);
    return proof.validUntil > now;
  }

  /**
   * Get proof validity period
   */
  static getProofValidityPeriod(): number {
    return 90 * 24 * 60 * 60; // 90 days
  }
}

/**
 * Circuit wrapper for DAO membership
 */
export class MembershipCircuit {
  /**
   * Compute nullifier for DAO action
   */
  static computeNullifier(
    tidHash: string,
    daoId: string,
    actionId: string
  ): string {
    const data = `${tidHash}-${daoId}-${actionId}`;
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);

    // Simple hash - in production use proper cryptographic hash
    let hash = 0;
    for (let i = 0; i < buffer.length; i++) {
      const char = buffer[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(16);
  }

  /**
   * Prepare membership proof data
   */
  static prepareWitness(data: {
    tidHash: string;
    ownerKey: string;
  }): MembershipProofData {
    return {
      tidHash: data.tidHash,
      ownerKey: data.ownerKey,
      daoId: '',
      nullifier: '',
      isMember: true,
    };
  }
}

/**
 * Circuit wrapper for credit range
 */
export class CreditRangeCircuit {
  /**
   * Calculate debt-to-income ratio
   */
  static calculateDTI(monthlyIncome: bigint, monthlyDebt: bigint): bigint {
    if (monthlyIncome === 0n) return 10000n; // 100%
    return (monthlyDebt * 10000n) / monthlyIncome;
  }

  /**
   * Check if DTI is acceptable
   */
  static isDTIAcceptable(dti: bigint, maxDTI = 5000n): boolean {
    return dti <= maxDTI;
  }

  /**
   * Determine credit tier from score
   */
  static getCreditTier(creditScore: bigint): number {
    if (creditScore >= 750n) return 4; // Excellent
    if (creditScore >= 700n) return 3; // Very Good
    if (creditScore >= 650n) return 2; // Good
    if (creditScore >= 600n) return 1; // Fair
    return 0; // Poor
  }
}

// Re-export types
export type { MustahikProofData, MembershipProofData, ZKProof };
