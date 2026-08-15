/**
 * SolanaWatcher - Watch for events on Solana
 *
 * @module @tawf/bridge-relayer/watchers
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { EventEmitter } from 'eventemitter3';

export interface SolanaWatcherConfig {
  rpcUrl: string;
  programId: string;
}

/**
 * Watches for events on Solana
 */
export class SolanaWatcher extends EventEmitter {
  private config: SolanaWatcherConfig;
  private connection?: Connection;
  private programId?: PublicKey;
  private isRunning = false;
  private pollInterval?: NodeJS.Timeout;
  private lastSignature = '';

  constructor(config: SolanaWatcherConfig) {
    super();
    this.config = config;
  }

  /**
   * Initialize the watcher
   */
  async initialize(): Promise<void> {
    this.connection = new Connection(this.config.rpcUrl, 'confirmed');
    this.programId = new PublicKey(this.config.programId);
  }

  /**
   * Start watching for events
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;

    // Poll for new transactions
    this.pollInterval = setInterval(async () => {
      await this.pollTransactions().catch(error => {
        this.emit('error', error);
      });
    }, 5000);

    this.emit('started');
  }

  /**
   * Stop watching for events
   */
  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }
    this.isRunning = false;
    this.emit('stopped');
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private async pollTransactions(): Promise<void> {
    if (!this.connection || !this.programId) {
      return;
    }

    const signatures = await this.connection.getSignaturesForAddress(
      this.programId,
      { limit: 10 }
    );

    for (const sigInfo of signatures) {
      if (sigInfo.signature === this.lastSignature) {
        break;
      }

      // Process transaction
      await this.processTransaction(sigInfo.signature);
    }

    if (signatures.length > 0) {
      this.lastSignature = signatures[0].signature;
    }
  }

  private async processTransaction(signature: string): Promise<void> {
    if (!this.connection) return;

    const tx = await this.connection.getParsedTransaction(signature);
    if (!tx) return;

    // Emit transaction event
    this.emit('transaction', {
      signature,
      slot: tx.slot,
      timestamp: tx.blockTime || 0,
    });
  }
}

export default SolanaWatcher;
