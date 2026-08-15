/**
 * ProofEngine - Client-side ZK proof generation and verification
 *
 * @module @tawf/wallet-sdk/core
 */

import type { ZKProof, ProofType } from '@tawf/types';
import { ProofSystem } from '@tawf/types';

export interface CircuitConfig {
  /** Circuit identifier */
  id: ProofType;
  /** WASM file path */
  wasmPath: string;
  /** Proving key file path */
  pkPath: string;
  /** Verification key file path */
  vkPath?: string;
}

export interface ProofInputs {
  [key: string]: bigint | string | number | boolean;
}

/**
 * Proof Engine for generating and verifying ZK proofs
 */
export class ProofEngine {
  private circuits: Map<ProofType, any> = new Map();
  private loaded = false;

  /**
   * Load a circuit for proof generation
   */
  async load(circuitId: ProofType): Promise<Circuit> {
    if (this.circuits.has(circuitId)) {
      return this.circuits.get(circuitId)!;
    }

    const config = this.getCircuitConfig(circuitId);
    const circuit = new Circuit(config);
    await circuit.initialize();

    this.circuits.set(circuitId, circuit);
    return circuit;
  }

  /**
   * Generate a proof
   */
  async generateProof(
    circuitId: ProofType,
    witness: ProofInputs,
    publicInputs: ProofInputs
  ): Promise<ZKProof> {
    const circuit = await this.load(circuitId);
    return circuit.execute(witness, publicInputs);
  }

  /**
   * Verify a proof
   */
  async verifyProof(proof: ZKProof): Promise<boolean> {
    const circuit = await this.load(proof.type);
    return circuit.verify(proof);
  }

  /**
   * Pre-load all circuits
   */
  async preloadCircuits(): Promise<void> {
    const circuitTypes: ProofType[] = [
      'mustahik_eligibility' as ProofType,
      'membership' as ProofType,
      'credit_range' as ProofType,
      'aggregate_report' as ProofType,
    ];

    await Promise.all(circuitTypes.map(t => this.load(t)));
    this.loaded = true;
  }

  /**
   * Check if circuits are loaded
   */
  isReady(): boolean {
    return this.loaded;
  }

  /**
   * Get circuit configuration
   */
  private getCircuitConfig(circuitId: ProofType): CircuitConfig {
    const configs: Record<ProofType, CircuitConfig> = {
      mustahik_eligibility: {
        id: 'mustahik_eligibility' as ProofType,
        wasmPath: '/circuits/mustahik_wasm.wasm',
        pkPath: '/circuits/mustahik_pk.key',
        vkPath: '/circuits/mustahik_vk.key',
      },
      membership: {
        id: 'membership' as ProofType,
        wasmPath: '/circuits/membership_wasm.wasm',
        pkPath: '/circuits/membership_pk.key',
        vkPath: '/circuits/membership_vk.key',
      },
      credit_range: {
        id: 'credit_range' as ProofType,
        wasmPath: '/circuits/credit_wasm.wasm',
        pkPath: '/circuits/credit_pk.key',
        vkPath: '/circuits/credit_vk.key',
      },
      aggregate_report: {
        id: 'aggregate_report' as ProofType,
        wasmPath: '/circuits/aggregate_wasm.wasm',
        pkPath: '/circuits/aggregate_pk.key',
        vkPath: '/circuits/aggregate_vk.key',
      },
    };

    const config = configs[circuitId];
    if (!config) {
      throw new Error(`Unknown circuit: ${circuitId}`);
    }

    return config;
  }
}

/**
 * Single circuit instance
 */
class Circuit {
  private config: CircuitConfig;
  private wasmInstance?: any;

  constructor(config: CircuitConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    // In production, this would load actual WASM and keys
    // For now, we simulate it
    this.wasmInstance = { loaded: true };
  }

  async execute(_witness: ProofInputs, publicInputs: ProofInputs): Promise<ZKProof> {
    if (!this.wasmInstance) {
      throw new Error('Circuit not initialized');
    }

    // Simulate proof generation
    // In production, this would call the actual ZK circuit
    return {
      type: this.config.id,
      system: ProofSystem.COMPACT_ZK,
      proofData: 'simulated_proof_data',
      publicInputs,
      timestamp: Math.floor(Date.now() / 1000),
      validUntil: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60, // 90 days
    };
  }

  async verify(proof: ZKProof): Promise<boolean> {
    // Simulate verification
    // In production, this would use the verification key
    return proof.validUntil > Math.floor(Date.now() / 1000);
  }
}

export default ProofEngine;
