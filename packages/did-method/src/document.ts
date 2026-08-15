/**
 * DID Document Builder for did:tawf method
 *
 * @module @tawf/did-method
 */

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

export interface JsonWebKey {
  kty: string;
  crv?: string;
  x: string;
  y?: string;
}

/**
 * Builder for creating DID documents
 */
export class DIDDocumentBuilder {
  private document: Partial<DIDDocument> = {
    verificationMethod: [],
    authentication: [],
    assertionMethod: [],
    capabilityInvocation: [],
    capabilityDelegation: [],
    service: [],
  };

  /**
   * Set DID
   */
  withId(id: string): this {
    this.document.id = id;
    return this;
  }

  /**
   * Set context
   */
  withContext(context: string | string[]): this {
    this.document['@context'] = context;
    return this;
  }

  /**
   * Add verification method
   */
  addVerificationMethod(vm: VerificationMethod): this {
    if (!this.document.verificationMethod) {
      this.document.verificationMethod = [];
    }
    this.document.verificationMethod.push(vm);
    return this;
  }

  /**
   * Add authentication method
   */
  addAuthentication(auth: VerificationMethod | string): this {
    if (!this.document.authentication) {
      this.document.authentication = [];
    }
    // Handle union type - ensure array is consistent
    if (typeof auth === 'string') {
      if (this.document.authentication.length > 0 && typeof this.document.authentication[0] !== 'string') {
        // Reset to string array if needed
        this.document.authentication = [auth];
      } else {
        (this.document.authentication as string[]).push(auth);
      }
    } else {
      if (this.document.authentication.length > 0 && typeof this.document.authentication[0] === 'string') {
        // Reset to VerificationMethod array if needed
        this.document.authentication = [auth];
      } else {
        (this.document.authentication as VerificationMethod[]).push(auth);
      }
    }
    return this;
  }

  /**
   * Add assertion method
   */
  addAssertionMethod(method: VerificationMethod | string): this {
    if (!this.document.assertionMethod) {
      this.document.assertionMethod = [];
    }
    // Handle union type - ensure array is consistent
    if (typeof method === 'string') {
      if (this.document.assertionMethod.length > 0 && typeof this.document.assertionMethod[0] !== 'string') {
        // Reset to string array if needed
        this.document.assertionMethod = [method];
      } else {
        (this.document.assertionMethod as string[]).push(method);
      }
    } else {
      if (this.document.assertionMethod.length > 0 && typeof this.document.assertionMethod[0] === 'string') {
        // Reset to VerificationMethod array if needed
        this.document.assertionMethod = [method];
      } else {
        (this.document.assertionMethod as VerificationMethod[]).push(method);
      }
    }
    return this;
  }

  /**
   * Add service endpoint
   */
  addService(service: ServiceEndpoint): this {
    if (!this.document.service) {
      this.document.service = [];
    }
    this.document.service.push(service);
    return this;
  }

  /**
   * Set controller
   */
  setController(controller: string | string[]): this {
    this.document.controller = controller;
    return this;
  }

  /**
   * Build the document
   */
  build(): DIDDocument {
    if (!this.document.id) {
      throw new Error('DID id is required');
    }

    if (!this.document['@context']) {
      this.document['@context'] = 'https://www.w3.org/ns/did/v1';
    }

    return this.document as DIDDocument;
  }
}

/**
 * Helper functions for DID document creation
 */
export class DIDDocumentHelpers {
  /**
   * Create a verification method from public key
   */
  static createVerificationMethod(params: {
    did: string;
    keyId: string;
    type: 'EcdsaSecp256k1RecoveryMethod2020' | 'Ed25519VerificationKey2020' | string;
    publicKey: string;
    format?: 'hex' | 'base58';
  }): VerificationMethod {
    const vm: VerificationMethod = {
      id: `${params.did}#${params.keyId}`,
      type: params.type,
      controller: params.did,
    };

    if (params.format === 'base58') {
      vm.publicKeyBase58 = params.publicKey;
    } else {
      vm.publicKeyHex = params.publicKey;
    }

    return vm;
  }

  /**
   * Create a service endpoint
   */
  static createServiceEndpoint(params: {
    did: string;
    id: string;
    type: string;
    endpoint: string | Record<string, unknown>;
  }): ServiceEndpoint {
    return {
      id: `${params.did}#${params.id}`,
      type: params.type,
      serviceEndpoint: params.endpoint,
    };
  }

  /**
   * Create default TID services
   */
  static createDefaultTIDServices(did: string, network: 'midnight' | 'ethereum' | 'base' | 'solana'): ServiceEndpoint[] {
    const baseEndpoint = `https://${network}.tawf.foundation`;

    return [
      {
        id: `${did}#credential`,
        type: 'TIDCredentialService',
        serviceEndpoint: `${baseEndpoint}/tid/${did.split(':').pop()}`,
      },
      {
        id: `${did}#verification`,
        type: 'TIDVerificationService',
        serviceEndpoint: `${baseEndpoint}/verify`,
      },
    ];
  }
}

export default DIDDocumentBuilder;
