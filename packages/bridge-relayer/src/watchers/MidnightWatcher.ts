/**
 * MidnightWatcher - Watch for events on Midnight Network
 *
 * @module @tawf/bridge-relayer/watchers
 */

import { EventEmitter } from 'eventemitter3';
import type { BridgeRelayer } from '../BridgeRelayer';
import type { TIDMintedEvent, TIDRevokedEvent, RootUpdateEvent, MidnightConfig } from '@tawf/types';

/**
 * Watches for events on Midnight Network
 */
export class MidnightWatcher extends EventEmitter {
  private config: MidnightConfig;
  private bridgeRelayer: BridgeRelayer;
  private isRunning = false;
  private pollInterval?: NodeJS.Timeout;
  private lastBlockNumber = 0;

  constructor(config: MidnightConfig, bridgeRelayer: BridgeRelayer) {
    super();
    this.config = config;
    this.bridgeRelayer = bridgeRelayer;
  }

  /**
   * Start watching for events
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastBlockNumber = await this.getCurrentBlock();

    // Poll for new events
    const interval = this.config.pollingInterval || 5000;
    this.pollInterval = setInterval(() => {
      this.pollEvents().catch(error => {
        this.emit('error', error);
      });
    }, interval);

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

  /**
   * Check if watcher is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private async pollEvents(): Promise<void> {
    const currentBlock = await this.getCurrentBlock();

    if (currentBlock <= this.lastBlockNumber) {
      return;
    }

    // Fetch events from last block to current
    const events = await this.fetchEvents(this.lastBlockNumber + 1, currentBlock);

    for (const event of events) {
      await this.handleEvent(event);
    }

    this.lastBlockNumber = currentBlock;
  }

  private async getCurrentBlock(): Promise<number> {
    // In production, fetch from actual Midnight provider
    return Math.floor(Date.now() / 1000);
  }

  private async fetchEvents(_fromBlock: number, _toBlock: number): Promise<any[]> {
    // In production, fetch actual events from Midnight contract
    // For now, return empty array
    return [];
  }

  private async handleEvent(event: any): Promise<void> {
    switch (event.type) {
      case 'TIDMinted':
        await this.handleTIDMinted(event as TIDMintedEvent);
        break;
      case 'TIDRevoked':
        await this.handleTIDRevoked(event as TIDRevokedEvent);
        break;
      case 'MerkleRootUpdated':
        await this.handleRootUpdate(event as RootUpdateEvent);
        break;
    }
  }

  private async handleTIDMinted(event: TIDMintedEvent): Promise<void> {
    this.emit('tidMinted', event);

    // Generate Merkle proof
    const merkleProof = await this.generateMerkleProof(event.tidHash);

    // Broadcast to all chains
    await this.bridgeRelayer.broadcast({
      type: 'MINT',
      tidHash: event.tidHash,
      owner: event.owner,
      proof: merkleProof,
      midnightBlock: event.blockNumber,
    });
  }

  private async handleTIDRevoked(event: TIDRevokedEvent): Promise<void> {
    this.emit('tidRevoked', event);

    await this.bridgeRelayer.broadcast({
      type: 'REVOKE',
      tidHash: event.tidHash,
      reason: event.reason,
    });
  }

  private async handleRootUpdate(event: RootUpdateEvent): Promise<void> {
    this.emit('rootUpdated', event);

    const signatures = await this.getGuardianSignatures(event);

    await Promise.all([
      this.bridgeRelayer.updateEthereumAnchor(event.newRoot, signatures),
      this.bridgeRelayer.updateBaseAttestation(event.newRoot, signatures),
      this.bridgeRelayer.updateSolanaState(event.newRoot, signatures),
    ]);
  }

  private async generateMerkleProof(_tidHash: string): Promise<string[]> {
    // In production, generate actual Merkle proof
    return [];
  }

  private async getGuardianSignatures(_event: RootUpdateEvent): Promise<string[]> {
    // In production, collect guardian signatures
    return [];
  }
}

export default MidnightWatcher;
