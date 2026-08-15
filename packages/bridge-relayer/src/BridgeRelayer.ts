/**
 * BridgeRelayer - Main cross-chain message relay service
 *
 * @module @tawf/bridge-relayer
 */

import { EventEmitter } from 'eventemitter3';
import { MidnightWatcher } from './watchers/MidnightWatcher';
import { EthereumWatcher } from './watchers/EthereumWatcher';
import { SolanaWatcher } from './watchers/SolanaWatcher';
import type { BridgeRelayerConfig } from '@tawf/types';

export interface BroadcastMessage {
  type: 'MINT' | 'REVOKE' | 'ROOT_UPDATE';
  tidHash?: string;
  owner?: string;
  proof?: string[];
  midnightBlock?: number;
  newRoot?: string;
  reason?: string;
}

/**
 * Bridge relayer service
 */
export class BridgeRelayer extends EventEmitter {
  private config: BridgeRelayerConfig;
  private midnightWatcher?: MidnightWatcher;
  private ethereumWatcher?: EthereumWatcher;
  private baseWatcher?: EthereumWatcher;
  private solanaWatcher?: SolanaWatcher;
  private isRunning = false;

  constructor(config: BridgeRelayerConfig) {
    super();
    this.config = config;
  }

  /**
   * Initialize all watchers
   */
  async initialize(): Promise<void> {
    // Initialize Midnight watcher
    this.midnightWatcher = new MidnightWatcher(
      this.config.midnight,
      this
    );

    // Initialize Ethereum watcher
    if (this.config.ethereum) {
      this.ethereumWatcher = new EthereumWatcher({
        ...this.config.ethereum,
        chain: 'ethereum',
      });
      await this.ethereumWatcher.initialize();
    }

    // Initialize Base watcher
    if (this.config.base) {
      this.baseWatcher = new EthereumWatcher({
        ...this.config.base,
        chain: 'base',
      });
      await this.baseWatcher.initialize();
    }

    // Initialize Solana watcher
    if (this.config.solana) {
      this.solanaWatcher = new SolanaWatcher(this.config.solana);
      await this.solanaWatcher.initialize();
    }

    // Wire up events
    this.setupEventHandlers();
  }

  /**
   * Start all watchers
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    await Promise.all([
      this.midnightWatcher?.start(),
      this.ethereumWatcher?.start(),
      this.baseWatcher?.start(),
      this.solanaWatcher?.start(),
    ]);

    this.isRunning = true;
    this.emit('started');
  }

  /**
   * Stop all watchers
   */
  stop(): void {
    this.midnightWatcher?.stop();
    this.ethereumWatcher?.stop();
    this.baseWatcher?.stop();
    this.solanaWatcher?.stop();

    this.isRunning = false;
    this.emit('stopped');
  }

  /**
   * Broadcast message to all destination chains
   */
  async broadcast(message: BroadcastMessage): Promise<void> {
    this.emit('broadcast', message);

    // Broadcast to Ethereum
    if (message.type === 'MINT' && this.config.ethereum) {
      await this.broadcastToEthereum(message);
    }

    // Broadcast to Base
    if (message.type === 'MINT' && this.config.base) {
      await this.broadcastToBase(message);
    }

    // Broadcast to Solana
    if (this.config.solana) {
      await this.broadcastToSolana(message);
    }
  }

  /**
   * Update Ethereum anchor with new merkle root
   */
  async updateEthereumAnchor(newRoot: string, _signatures: string[]): Promise<void> {
    this.emit('updatingEthereum', { newRoot });

    // In production, submit transaction to TIDAnchor contract
    this.emit('ethereumUpdated', { newRoot });
  }

  /**
   * Update Base attestation with new merkle root
   */
  async updateBaseAttestation(newRoot: string, _signatures: string[]): Promise<void> {
    this.emit('updatingBase', { newRoot });

    // In production, submit transaction to TIDAnchor contract
    this.emit('baseUpdated', { newRoot });
  }

  /**
   * Update Solana state with new merkle root
   */
  async updateSolanaState(newRoot: string, _signatures: string[]): Promise<void> {
    this.emit('updatingSolana', { newRoot });

    // In production, submit transaction to Solana program
    this.emit('solanaUpdated', { newRoot });
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private setupEventHandlers(): void {
    // Midnight events
    this.midnightWatcher?.on('tidMinted', (event) => {
      this.emit('midnight.tidMinted', event);
    });

    this.midnightWatcher?.on('tidRevoked', (event) => {
      this.emit('midnight.tidRevoked', event);
    });

    this.midnightWatcher?.on('rootUpdated', (event) => {
      this.emit('midnight.rootUpdated', event);
    });

    // Ethereum events
    this.ethereumWatcher?.on('RootUpdated', (event) => {
      this.emit('ethereum.rootUpdated', event);
    });

    // Base events
    this.baseWatcher?.on('AttestationIssued', (event) => {
      this.emit('base.attestationIssued', event);
    });

    this.baseWatcher?.on('AttestationRevoked', (event) => {
      this.emit('base.attestationRevoked', event);
    });

    // Solana events
    this.solanaWatcher?.on('transaction', (event) => {
      this.emit('solana.transaction', event);
    });
  }

  private async broadcastToEthereum(message: BroadcastMessage): Promise<void> {
    // In production, submit to Ethereum contract
    this.emit('ethereum.broadcast', message);
  }

  private async broadcastToBase(message: BroadcastMessage): Promise<void> {
    // In production, submit to Base contract
    this.emit('base.broadcast', message);
  }

  private async broadcastToSolana(message: BroadcastMessage): Promise<void> {
    // In production, submit to Solana program
    this.emit('solana.broadcast', message);
  }
}

export default BridgeRelayer;
