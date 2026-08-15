/**
 * EthereumWatcher - Watch for events on Ethereum/Base
 *
 * @module @tawf/bridge-relayer/watchers
 */

import { ethers } from 'ethers';
import { EventEmitter } from 'eventemitter3';

export interface EthereumWatcherConfig {
  rpcUrl: string;
  anchorAddress?: string;
  attestationAddress?: string;
  chain: 'ethereum' | 'base';
}

/**
 * Watches for events on Ethereum or Base
 */
export class EthereumWatcher extends EventEmitter {
  private config: EthereumWatcherConfig;
  private provider?: ethers.JsonRpcProvider;
  private anchorContract?: ethers.Contract;
  private attestationContract?: ethers.Contract;
  private isRunning = false;

  // Minimal ABIs
  private readonly ANCHOR_ABI = [
    'event RootUpdated(bytes32 indexed oldRoot, bytes32 indexed newRoot, uint256 midnightBlock)',
  ];

  private readonly ATTESTATION_ABI = [
    'event AttestationIssued(uint256 indexed tokenId, address indexed owner, bytes32 tidHash)',
    'event AttestationRevoked(uint256 indexed tokenId)',
  ];

  constructor(config: EthereumWatcherConfig) {
    super();
    this.config = config;
  }

  /**
   * Initialize the watcher
   */
  async initialize(): Promise<void> {
    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);

    if (this.config.anchorAddress) {
      this.anchorContract = new ethers.Contract(
        this.config.anchorAddress,
        this.ANCHOR_ABI,
        this.provider
      );
    }

    if (this.config.attestationAddress) {
      this.attestationContract = new ethers.Contract(
        this.config.attestationAddress,
        this.ATTESTATION_ABI,
        this.provider
      );
    }
  }

  /**
   * Start watching for events
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    if (this.anchorContract) {
      this.anchorContract.on('RootUpdated', (oldRoot, newRoot, midnightBlock) => {
        this.emit('RootUpdated', {
          chain: this.config.chain,
          oldRoot,
          newRoot,
          midnightBlock: midnightBlock.toString(),
        });
      });
    }

    if (this.attestationContract) {
      this.attestationContract.on('AttestationIssued', (tokenId, owner, tidHash) => {
        this.emit('AttestationIssued', {
          chain: this.config.chain,
          tokenId: tokenId.toString(),
          owner,
          tidHash,
        });
      });

      this.attestationContract.on('AttestationRevoked', (tokenId) => {
        this.emit('AttestationRevoked', {
          chain: this.config.chain,
          tokenId: tokenId.toString(),
        });
      });
    }

    this.isRunning = true;
    this.emit('started');
  }

  /**
   * Stop watching for events
   */
  stop(): void {
    if (this.anchorContract) {
      this.anchorContract.removeAllListeners();
    }

    if (this.attestationContract) {
      this.attestationContract.removeAllListeners();
    }

    this.isRunning = false;
    this.emit('stopped');
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    if (!this.provider) {
      throw new Error('Watcher not initialized');
    }
    return await this.provider.getBlockNumber();
  }
}

export default EthereumWatcher;
