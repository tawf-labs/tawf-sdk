/**
 * DIDResolver - DID document resolution for did:tawf
 *
 * @module @tawf/wallet-sdk/core
 */

import type { TIDConfig } from './TIDManager';

/**
 * JSON Web Key (JWK) format for cryptographic keys
 * RFC 7517: https://www.rfc-editor.org/rfc/rfc7517
 */
interface JsonWebKey {
  kty?: string; // Key Type
  alg?: string; // Algorithm
  use?: string; // Public Key Use
  kid?: string; // Key ID
  x: string; // X coordinate
  y?: string; // Y coordinate
  crv?: string; // Curve
}

export interface DIDDocument {
  '@context': string | string[];
  id: string;
  alsoKnownAs?: string[];
  controller?: string | string[];
  verificationMethod: VerificationMethod[];
  authentication: VerificationMethod[] | string[];
  assertionMethod: VerificationMethod[] | string[];
  capabilityInvocation: VerificationMethod[] | string[];
  capabilityDelegation: VerificationMethod[] | string[];
  keyAgreement?: VerificationMethod[] | string[];
  service: ServiceEndpoint[];
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyJwk?: JsonWebKey;
  publicKeyBase58?: string;
  publicKeyHex?: string;
}

export interface ServiceEndpoint {
  id: string;
  type: string;
  serviceEndpoint: string | Record<string, unknown>;
}

/**
 * DID Resolver for did:tawf method
 */
export class DIDResolver {
  private config: TIDConfig;
  private resolutionCache: Map<string, DIDDocument> = new Map();

  constructor(config: TIDConfig) {
    this.config = config;
  }

  /**
   * Resolve a DID to its DID document
   */
  async resolve(did: string): Promise<DIDDocument> {
    // Check cache
    if (this.resolutionCache.has(did)) {
      return this.resolutionCache.get(did)!;
    }

    // Parse DID
    const parsed = this.parseDID(did);
    if (!parsed) {
      throw new Error(`Invalid DID: ${did}`);
    }

    // Fetch document from Midnight Network
    const document = await this.fetchDocument(parsed);

    // Cache result
    this.resolutionCache.set(did, document);

    return document;
  }

  /**
   * Resolve DID Document metadata
   */
  async resolveMetadata(did: string): Promise<{
    created: number;
    updated: number;
    deactivated: boolean;
  }> {
    await this.resolve(did);

    return {
      created: 0, // Fetch from contract
      updated: 0, // Fetch from contract
      deactivated: false, // Check revocation
    };
  }

  /**
   * Dereference a DID URL
   */
  async dereference(didUrl: string): Promise<DIDDocument | VerificationMethod | ServiceEndpoint> {
    const document = await this.resolve(this.extractDID(didUrl));
    const fragment = this.extractFragment(didUrl);

    if (!fragment) {
      return document;
    }

    // Find verification method or service by ID
    const vm = document.verificationMethod.find(m => m.id.endsWith(fragment));
    if (vm) return vm;

    const service = document.service.find(s => s.id.endsWith(fragment));
    if (service) return service;

    throw new Error(`DID URL fragment not found: ${fragment}`);
  }

  /**
   * Clear resolution cache
   */
  clearCache(): void {
    this.resolutionCache.clear();
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private parseDID(did: string): ParsedDID | null {
    const match = did.match(/^did:tawf:(\w+):(.+)$/);
    if (!match) return null;

    return {
      method: 'tawf',
      network: match[1],
      identifier: match[2],
    };
  }

  private async fetchDocument(parsed: ParsedDID): Promise<DIDDocument> {
    // Construct base DID document
    const did = `did:tawf:${parsed.network}:${parsed.identifier}`;

    const document: DIDDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/secp256k1-2020/v2',
      ],
      id: did,
      verificationMethod: [
        {
          id: `${did}#controller`,
          type: 'EcdsaSecp256k1RecoveryMethod2020',
          controller: did,
          publicKeyBase58: parsed.identifier, // Simplified
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
          serviceEndpoint: {
            uri: `${this.config.midnight.providerUrl}/tid/${parsed.identifier}`,
            networks: ['midnight', 'ethereum', 'base', 'solana'],
          },
        },
        {
          id: `${did}#verification`,
          type: 'TIDVerificationService',
          serviceEndpoint: `${this.config.midnight.providerUrl}/verify`,
        },
      ],
    };

    return document;
  }

  private extractDID(didUrl: string): string {
    const hashIndex = didUrl.indexOf('#');
    return hashIndex >= 0 ? didUrl.substring(0, hashIndex) : didUrl;
  }

  private extractFragment(didUrl: string): string | null {
    const hashIndex = didUrl.indexOf('#');
    return hashIndex >= 0 ? didUrl.substring(hashIndex + 1) : null;
  }
}

interface ParsedDID {
  method: string;
  network: string;
  identifier: string;
}

export default DIDResolver;
