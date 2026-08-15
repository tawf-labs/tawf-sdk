/**
 * @tawf/did-method - did:tawf DID method specification and resolver
 */

export { UniversalResolver } from './resolver';
export type { ResolutionResult, ResolverConfig } from './resolver';

export { DIDDocumentBuilder, DIDDocumentHelpers } from './document';
export type {
  DIDDocument,
  VerificationMethod,
  ServiceEndpoint,
  JsonWebKey,
} from './document';

export * from './verification-method';

// Re-export commonly used types
export type { ParsedDID } from './verification-method';
