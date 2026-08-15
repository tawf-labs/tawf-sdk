/**
 * Universal DID Resolver for did:tawf method
 *
 * @module @tawf/did-method
 */

import type { DIDDocument } from './document';
import { parseDid } from './verification-method';

export interface ResolutionResult {
  didDocument: DIDDocument;
  didResolutionMetadata: {
    contentType: string;
    updated?: string;
  };
  didDocumentMetadata: {
    created: string;
    updated: string;
    deactivated: boolean;
    versionId: string;
  };
}

export interface ResolverConfig {
  midnightEndpoint?: string;
  ethereumEndpoint?: string;
  baseEndpoint?: string;
  solanaEndpoint?: string;
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}

/**
 * Universal DID resolver for did:tawf
 */
export class UniversalResolver {
  private config: ResolverConfig;
  private cache: Map<string, { doc: DIDDocument; expires: number }> = new Map();

  constructor(config: ResolverConfig = {}) {
    this.config = {
      cache: {
        enabled: true,
        ttl: 3600000, // 1 hour
        ...config.cache,
      },
      ...config,
    };
  }

  /**
   * Resolve a DID to its DID document
   */
  async resolve(did: string): Promise<ResolutionResult> {
    // Check cache
    if (this.config.cache?.enabled) {
      const cached = this.cache.get(did);
      if (cached && cached.expires > Date.now()) {
        return this.buildResult(cached.doc);
      }
    }

    // Parse DID
    const parsed = parseDid(did);
    if (parsed.method !== 'tawf') {
      throw new Error(`Unsupported DID method: ${parsed.method}`);
    }

    // Resolve based on network
    const document = await this.resolveOnNetwork(parsed);

    // Cache result
    if (this.config.cache?.enabled) {
      this.cache.set(did, {
        doc: document,
        expires: Date.now() + (this.config.cache?.ttl || 3600000),
      });
    }

    return this.buildResult(document);
  }

  /**
   * Resolve DID Dereferencing
   */
  async dereference(didUrl: string): Promise<DIDDocument | object> {
    const result = await this.resolve(this.extractDid(didUrl));
    const fragment = this.extractFragment(didUrl);

    if (!fragment) {
      return result.didDocument;
    }

    return this.dereferenceFragment(result.didDocument, fragment);
  }

  /**
   * Clear resolution cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private async resolveOnNetwork(parsed: ParsedDID): Promise<DIDDocument> {
    const network = parsed.network || 'midnight';

    switch (network) {
      case 'midnight':
        return this.resolveOnMidnight(parsed);
      case 'ethereum':
        return this.resolveOnEthereum(parsed);
      case 'base':
        return this.resolveOnBase(parsed);
      case 'solana':
        return this.resolveOnSolana(parsed);
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  }

  private async resolveOnMidnight(parsed: ParsedDID): Promise<DIDDocument> {
    // In production, fetch from Midnight contract
    const did = `did:tawf:midnight:${parsed.identifier}`;

    return {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/secp256k1-2020/v2',
      ],
      id: did,
      controller: did,
      verificationMethod: [
        {
          id: `${did}#controller`,
          type: 'EcdsaSecp256k1RecoveryMethod2020',
          controller: did,
          publicKeyHex: parsed.identifier,
        },
      ],
      authentication: [`${did}#controller`],
      assertionMethod: [`${did}#controller`],
      capabilityInvocation: [`${did}#controller`],
      capabilityDelegation: [`${did}#controller`],
      service: [
        {
          id: `${did}#midnight`,
          type: 'TIDCredentialService',
          serviceEndpoint: `${this.config.midnightEndpoint || 'https://midnight.tawf.foundation'}/tid/${parsed.identifier}`,
        },
        {
          id: `${did}#verification`,
          type: 'TIDVerificationService',
          serviceEndpoint: `${this.config.midnightEndpoint || 'https://midnight.tawf.foundation'}/verify`,
        },
      ],
    };
  }

  private async resolveOnEthereum(parsed: ParsedDID): Promise<DIDDocument> {
    const did = `did:tawf:ethereum:${parsed.identifier}`;

    return {
      '@context': 'https://www.w3.org/ns/did/v1',
      id: did,
      verificationMethod: [
        {
          id: `${did}#controller`,
          type: 'EcdsaSecp256k1RecoveryMethod2020',
          controller: did,
          publicKeyHex: parsed.identifier,
        },
      ],
      authentication: [`${did}#controller`],
      assertionMethod: [`${did}#controller`],
      capabilityInvocation: [`${did}#controller`],
      capabilityDelegation: [`${did}#controller`],
      service: [
        {
          id: `${did}#anchor`,
          type: 'TIDAnchorService',
          serviceEndpoint: `${this.config.ethereumEndpoint || 'https://ethereum.tawf.foundation'}/anchor`,
        },
      ],
    };
  }

  private async resolveOnBase(parsed: ParsedDID): Promise<DIDDocument> {
    const did = `did:tawf:base:${parsed.identifier}`;

    return {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1',
      ],
      id: did,
      verificationMethod: [
        {
          id: `${did}#controller`,
          type: 'EcdsaSecp256k1RecoveryMethod2020',
          controller: did,
          publicKeyHex: parsed.identifier,
        },
      ],
      authentication: [`${did}#controller`],
      assertionMethod: [`${did}#controller`],
      capabilityInvocation: [`${did}#controller`],
      capabilityDelegation: [`${did}#controller`],
      service: [
        {
          id: `${did}#attestation`,
          type: 'TIDAttestationService',
          serviceEndpoint: `${this.config.baseEndpoint || 'https://base.tawf.foundation'}/attestation`,
        },
      ],
    };
  }

  private async resolveOnSolana(parsed: ParsedDID): Promise<DIDDocument> {
    const did = `did:tawf:solana:${parsed.identifier}`;

    return {
      '@context': 'https://www.w3.org/ns/did/v1',
      id: did,
      verificationMethod: [
        {
          id: `${did}#controller`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyBase58: parsed.identifier,
        },
      ],
      authentication: [`${did}#controller`],
      assertionMethod: [`${did}#controller`],
      capabilityInvocation: [`${did}#controller`],
      capabilityDelegation: [`${did}#controller`],
      service: [
        {
          id: `${did}#program`,
          type: 'TIDProgramService',
          serviceEndpoint: `${this.config.solanaEndpoint || 'https://solana.tawf.foundation'}/program`,
        },
      ],
    };
  }

  private buildResult(doc: DIDDocument): ResolutionResult {
    return {
      didDocument: doc,
      didResolutionMetadata: {
        contentType: 'application/did+ld+json',
      },
      didDocumentMetadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        deactivated: false,
        versionId: '1',
      },
    };
  }

  private extractDid(didUrl: string): string {
    const hashIndex = didUrl.indexOf('#');
    return hashIndex >= 0 ? didUrl.substring(0, hashIndex) : didUrl;
  }

  private extractFragment(didUrl: string): string | null {
    const hashIndex = didUrl.indexOf('#');
    return hashIndex >= 0 ? didUrl.substring(hashIndex + 1) : null;
  }

  private dereferenceFragment(document: DIDDocument, fragment: string): object {
    // Search in verification methods
    const vm = document.verificationMethod.find(m => m.id.endsWith(fragment));
    if (vm) return vm;

    // Search in services
    const service = document.service.find(s => s.id.endsWith(fragment));
    if (service) return service;

    throw new Error(`DID URL fragment not found: ${fragment}`);
  }
}

interface ParsedDID {
  did: string;
  method: string;
  network?: string;
  identifier: string;
}

export default UniversalResolver;
