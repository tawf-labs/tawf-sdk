import { Link } from 'react-router-dom';
import { ShieldCheck, Puzzle, ArrowRight } from 'lucide-react';

const IDENTITY_PACKAGES = [
  ['@tawf/types', 'Shared TypeScript types for the Tawf DID protocol'],
  ['@tawf/wallet-sdk', 'React Native SDK for TID wallet integration'],
  ['@tawf/did-method', 'did:tawf DID method spec and universal resolver'],
  ['@tawf/solidity-contracts', 'Ethereum Solidity contracts, ERC-5192 SBT and merkle anchoring'],
  ['@tawf/compact-contracts', 'Midnight Network Compact ZK smart contracts'],
  ['@tawf/bridge-relayer', 'Cross-chain message relay service'],
];

const VERIFY_PACKAGES = [
  ['@tawf/verify-core', 'Canonicalization, Merkle hashing, proof verification, zero deps'],
  ['@tawf/verify-server', 'Node/Bun server SDK for record buffering and anchor submission'],
  ['@tawf/verify-react', 'Drop-in React components, VerifyBadge, VerifyPanel, TransparencyBoard'],
  ['@tawf/verify-cli', 'CLI for operator-side audit, prove, record, and check'],
];

export default function Overview() {
  return (
    <div>
      <section className="bg-tawf-green text-tawf-sand py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-tawf-gold text-sm font-semibold tracking-[0.2em] uppercase mb-4">
            Tawf SDK
          </p>
          <h1 className="text-5xl md:text-6xl font-light leading-tight mb-6">
            Build on Tawf.
          </h1>
          <p className="text-lg text-tawf-sand/70 max-w-2xl leading-relaxed">
            TypeScript SDKs and smart contracts for the Tawf Islamic Foundation ecosystem.
            Soulbound identity and cryptographic notarization, published as composable
            @tawf packages on Ethereum.
          </p>
          <div className="flex gap-4 mt-10">
            <Link
              to="/integration"
              className="inline-flex items-center gap-2 bg-tawf-gold text-tawf-green px-6 py-3 rounded-full text-sm font-semibold tracking-widest uppercase hover:bg-white transition-colors"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            to="/identity"
            className="p-8 bg-white rounded-2xl border border-tawf-green/10 hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 bg-tawf-green/10 rounded-full flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6 text-tawf-green" />
            </div>
            <h2 className="font-serif text-2xl text-tawf-green mb-3">Identity</h2>
            <p className="text-tawf-muted leading-relaxed mb-6">
              The Tawf ID (TID) stack. A soulbound, zero-knowledge identity credential
              backed by ERC-5192 contracts on Ethereum.
            </p>
            <ul className="space-y-2 mb-6">
              {IDENTITY_PACKAGES.map(([name, desc]) => (
                <li key={name} className="text-sm">
                  <code className="text-tawf-green font-semibold">{name}</code>
                  <span className="text-tawf-muted">: {desc}</span>
                </li>
              ))}
            </ul>
            <span className="text-tawf-green font-medium text-sm tracking-widest uppercase inline-flex items-center gap-2">
              Identity docs <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link
            to="/notarization"
            className="p-8 bg-white rounded-2xl border border-tawf-green/10 hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 bg-tawf-green/10 rounded-full flex items-center justify-center mb-5">
              <Puzzle className="w-6 h-6 text-tawf-green" />
            </div>
            <h2 className="font-serif text-2xl text-tawf-green mb-3">Notarization</h2>
            <p className="text-tawf-muted leading-relaxed mb-6">
              The tawf-verify stack. Batch-anchor off-chain records to Ethereum and verify
              them without trusting the operator.
            </p>
            <ul className="space-y-2 mb-6">
              {VERIFY_PACKAGES.map(([name, desc]) => (
                <li key={name} className="text-sm">
                  <code className="text-tawf-green font-semibold">{name}</code>
                  <span className="text-tawf-muted">: {desc}</span>
                </li>
              ))}
            </ul>
            <span className="text-tawf-green font-medium text-sm tracking-widest uppercase inline-flex items-center gap-2">
              Notarization docs <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}