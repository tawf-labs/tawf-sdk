/**
 * Verification Method utilities for did:tawf
 *
 * @module @tawf/did-method
 */

export interface ParsedDID {
  did: string;
  method: string;
  network?: string;
  identifier: string;
}

/**
 * Parse a DID string
 */
export function parseDid(did: string): ParsedDID {
  const match = did.match(/^did:([a-z0-9]+)(?::([a-z0-9]+))?:(.+)$/i);
  if (!match) {
    throw new Error(`Invalid DID: ${did}`);
  }

  return {
    did,
    method: match[1],
    network: match[2],
    identifier: match[3],
  };
}

/**
 * Validate a DID string
 */
export function validateDid(did: string): boolean {
  try {
    const parsed = parseDid(did);

    // Check method is 'tawf'
    if (parsed.method !== 'tawf') {
      return false;
    }

    // Check network if present
    if (parsed.network) {
      const validNetworks = ['midnight', 'ethereum', 'base', 'solana'];
      if (!validNetworks.includes(parsed.network)) {
        return false;
      }
    }

    // Check identifier is valid hex
    const hexRegex = /^[0-9a-fA-F]+$/;
    if (!hexRegex.test(parsed.identifier)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get DID from components
 */
export function buildDid(params: {
  method?: string;
  network?: string;
  identifier: string;
}): string {
  const method = params.method || 'tawf';
  const network = params.network ? `:${params.network}` : '';
  return `did:${method}${network}:${params.identifier}`;
}

/**
 * Extract DID from DID URL
 */
export function extractDid(didUrl: string): string {
  const hashIndex = didUrl.indexOf('#');
  const queryIndex = didUrl.indexOf('?');

  let end = didUrl.length;
  if (hashIndex >= 0) end = Math.min(end, hashIndex);
  if (queryIndex >= 0) end = Math.min(end, queryIndex);

  return didUrl.substring(0, end);
}

/**
 * Extract fragment from DID URL
 */
export function extractFragment(didUrl: string): string | null {
  const hashIndex = didUrl.indexOf('#');
  return hashIndex >= 0 ? didUrl.substring(hashIndex + 1) : null;
}

/**
 * Extract query parameters from DID URL
 */
export function extractQuery(didUrl: string): Record<string, string> | null {
  const queryIndex = didUrl.indexOf('?');
  if (queryIndex < 0) return null;

  const hashIndex = didUrl.indexOf('#');
  const end = hashIndex >= 0 ? hashIndex : didUrl.length;

  const queryString = didUrl.substring(queryIndex + 1, end);
  const params = new URLSearchParams(queryString);

  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

/**
 * Convert DID to CAIP-10 account ID
 */
export function didToCaip10(did: string): string | null {
  const parsed = parseDid(did);

  if (!parsed.network) {
    return null;
  }

  const chainIds: Record<string, string> = {
    midnight: 'midnight',
    ethereum: 'eip155:1',
    base: 'eip155:8453',
    solana: 'solana',
  };

  const chainId = chainIds[parsed.network];
  if (!chainId) {
    return null;
  }

  return `${chainId}:${parsed.identifier}`;
}

/**
 * Convert CAIP-10 account ID to DID
 */
export function caip10ToDid(caip10: string): string | null {
  const [chainId, address] = caip10.split(':');

  const networkMap: Record<string, string> = {
    'midnight': 'midnight',
    'eip155:1': 'ethereum',
    'eip155:8453': 'base',
    'solana': 'solana',
  };

  const network = networkMap[chainId];
  if (!network) {
    return null;
  }

  return `did:tawf:${network}:${address}`;
}

export default {
  parseDid,
  validateDid,
  buildDid,
  extractDid,
  extractFragment,
  extractQuery,
  didToCaip10,
  caip10ToDid,
};
