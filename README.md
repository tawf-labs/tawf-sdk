# tawf-sdk

TypeScript SDKs and smart contracts for the Tawf Islamic Foundation ecosystem. Identity (Tawf ID) and cryptographic notarization (tawf-verify) libraries.

Moved from [tawf-did](https://github.com/tawf-labs/tawf-did) and [tawf-verify](https://github.com/tawf-labs/tawf-verify) into a single, discoverable monorepo.

## Packages

### Identity (Tawf ID)

| Package | Description |
|---|---|
| `@tawf/types` | Shared TypeScript types for the Tawf DID protocol |
| `@tawf/wallet-sdk` | React Native SDK for TID wallet integration |
| `@tawf/did-method` | `did:tawf` DID method spec and universal resolver |
| `@tawf/solidity-contracts` | Ethereum Solidity contracts (ERC-5192 SBT, merkle anchoring) |
| `@tawf/compact-contracts` | Midnight Network Compact ZK smart contracts |
| `@tawf/bridge-relayer` | Cross-chain message relay service |

### Notarization (tawf-verify)

| Package | Description |
|---|---|
| `@tawf/verify-core` | Canonicalization, Merkle hashing, proof verification (isomorphic, zero deps) |
| `@tawf/verify-server` | Node/Bun server SDK for record buffering and anchor submission |
| `@tawf/verify-react` | Drop-in React UI components: VerifyBadge, VerifyPanel, TransparencyBoard |
| `@tawf/verify-cli` | CLI tool for operator-side audit, prove, record, and check commands |

## Usage

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
```

## Publishing

These packages are designed to be consumed as `@tawf/*` from npm. During development, apps in sibling repos can use `pnpm link` or file references.

## License

Apache 2.0