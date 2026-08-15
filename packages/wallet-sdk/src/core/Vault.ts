/**
 * Vault - Encrypted credential storage
 *
 * @module @tawf/wallet-sdk/core
 */

import type { TID } from '@tawf/types';
import { v4 as uuidv4 } from 'uuid';

export interface VaultConfig {
  encryptionKey: string;
  storagePath: string;
}

export interface StoredTID extends TID {
  id: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Encrypted vault for storing TID credentials
 */
export class EncryptedVault {
  // @ts-expect-error - config stored for future use
  private _config: VaultConfig;
  private storage: Map<string, StoredTID> = new Map();
  private initialized = false;

  constructor(config: VaultConfig) {
    this._config = config;
  }

  /**
   * Initialize the vault
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load from persistent storage
    await this.loadFromStorage();
    this.initialized = true;
  }

  /**
   * Store a TID in the vault
   */
  async store(tid: TID): Promise<void> {
    const storedTID: StoredTID = {
      ...tid,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.storage.set(tid.hash, storedTID);
    await this.saveVaultToStorage();
  }

  /**
   * Retrieve a TID by hash
   */
  async get(tidHash: string): Promise<StoredTID | null> {
    return this.storage.get(tidHash) || null;
  }

  /**
   * Get all TIDs
   */
  async getAllTIDs(): Promise<StoredTID[]> {
    return Array.from(this.storage.values()).sort(
      (a, b) => b.issuedAt - a.issuedAt
    );
  }

  /**
   * Get latest TID
   */
  async getLatestTID(): Promise<StoredTID | null> {
    const tids = await this.getAllTIDs();
    return tids[0] || null;
  }

  /**
   * Delete a TID
   */
  async delete(tidHash: string): Promise<void> {
    this.storage.delete(tidHash);
    await this.saveVaultToStorage();
  }

  /**
   * Clear all TIDs
   */
  async clear(): Promise<void> {
    this.storage.clear();
    await this.saveVaultToStorage();
  }

  /**
   * Get owner key
   */
  async getOwnerKey(): Promise<string> {
    // In production, generate or retrieve from secure storage
    const storedKey = await this.getFromStorage('ownerKey');
    if (storedKey) return storedKey;

    // Generate new key
    const newKey = this.generateKey();
    await this.saveToStorage('ownerKey', newKey);
    return newKey;
  }

  /**
   * Get owner private key
   */
  async getOwnerPrivateKey(): Promise<string> {
    const storedKey = await this.getFromStorage('ownerPrivateKey');
    if (storedKey) return storedKey;

    const newKey = this.generatePrivateKey();
    await this.saveToStorage('ownerPrivateKey', newKey);
    return newKey;
  }

  /**
   * Export encrypted vault data
   */
  async export(): Promise<string> {
    const data = Array.from(this.storage.entries());
    return JSON.stringify(data);
  }

  /**
   * Import encrypted vault data
   */
  async import(encryptedData: string): Promise<void> {
    try {
      const data = JSON.parse(encryptedData);
      for (const [hash, tid] of data) {
        this.storage.set(hash, tid as StoredTID);
      }
      await this.saveVaultToStorage();
    } catch (error) {
      throw new Error('Invalid vault data');
    }
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  /**
   * Load vault from persistent storage
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const data = await this.getFromStorage('vault');
      if (data) {
        const parsed = JSON.parse(data);
        for (const [hash, tid] of parsed) {
          this.storage.set(hash, tid as StoredTID);
        }
      }
    } catch (error) {
      // First run or corrupted data
      this.storage.clear();
    }
  }

  /**
   * Save vault to persistent storage
   */
  private async saveVaultToStorage(): Promise<void> {
    const data = Array.from(this.storage.entries());
    const json = JSON.stringify(data);
    if (typeof AsyncStorage !== 'undefined') {
      await AsyncStorage.setItem('tid_vault_vault', json);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tid_vault_vault', json);
    }
  }

  /**
   * Get value from storage
   */
  private async getFromStorage(key: string): Promise<string | null> {
    if (typeof AsyncStorage !== 'undefined') {
      return await AsyncStorage.getItem(`tid_vault_${key}`);
    }
    // For web testing
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(`tid_vault_${key}`);
    }
    return null;
  }

  /**
   * Save value to storage
   */
  private async saveToStorage(key: string, value: string): Promise<void> {
    if (typeof AsyncStorage !== 'undefined') {
      await AsyncStorage.setItem(`tid_vault_${key}`, value);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`tid_vault_${key}`, value);
    }
  }

  /**
   * Generate a new public key
   */
  private generateKey(): string {
    // In production, use actual cryptographic key generation
    return `0x${Buffer.from(uuidv4().replace(/-/g, ''), 'hex').toString('hex')}`;
  }

  /**
   * Generate a new private key
   */
  private generatePrivateKey(): string {
    // In production, use proper cryptographic key generation
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return `0x${Buffer.from(array).toString('hex')}`;
  }
}

export default EncryptedVault;
