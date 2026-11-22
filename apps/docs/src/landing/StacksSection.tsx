import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { CONTAINER, IsoGrid, RevealText, Stagger, StaggerItem } from '../motion';
import { IdentityGlyph, NotarizationGlyph } from './art/FeatureGlyphs';

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

const CARDS = [
  {
    to: '/identity',
    Glyph: IdentityGlyph,
    title: 'Identity',
    desc: 'The Tawf ID (TID) stack. A soulbound, zero-knowledge identity credential backed by ERC-5192 contracts on Ethereum.',
    packages: IDENTITY_PACKAGES,
  },
  {
    to: '/notarization',
    Glyph: NotarizationGlyph,
    title: 'Notarization',
    desc: 'The tawf-verify stack. Batch-anchor off-chain records to Ethereum and verify them without trusting the operator.',
    packages: VERIFY_PACKAGES,
  },
];

export default function StacksSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--l-stone)] py-16 md:py-24">
      <IsoGrid cy="40%" opacity={0.8} />
      <div className={`${CONTAINER} relative z-10`}>
        <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {CARDS.map(({ to, Glyph, title, desc, packages }) => (
            <StaggerItem key={to}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="h-full rounded-2xl border border-[var(--l-line)] bg-[var(--l-paper)] p-8"
              >
                <Glyph className="mb-4 h-24 w-24" />
                <RevealText text={title} as="h2" className="mb-3 text-2xl" />
                <p className="mb-6 leading-relaxed text-[var(--l-muted)]">{desc}</p>
                <ul className="mb-6 space-y-2">
                  {packages.map(([name, d]) => (
                    <li key={name} className="text-sm">
                      <code className="font-semibold text-[var(--l-accent)]">{name}</code>
                      <span className="text-[var(--l-muted)]">: {d}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={to}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-[var(--l-accent)] transition-colors hover:text-[var(--l-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--l-accent)]"
                >
                  Read the docs <ArrowRight className="size-4" />
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
