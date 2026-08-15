import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Puzzle, ArrowRight } from 'lucide-react';
import PageHero from '../components/PageHero';
import Section from '../components/Section';

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
    <>
      <PageHero
        badge="Developer Hub"
        title="Build on Tawf"
        subtitle="SDKs for identity and notarization"
        description="TypeScript SDKs and smart contracts for the Tawf Islamic Foundation ecosystem. Soulbound identity and cryptographic notarization, published as composable @tawf packages on Ethereum."
        background="green"
      />

      <Section background="sand">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              to: '/identity',
              icon: <ShieldCheck className="w-6 h-6 text-tawf-green" />,
              title: 'Identity',
              desc: 'The Tawf ID (TID) stack. A soulbound, zero-knowledge identity credential backed by ERC-5192 contracts on Ethereum.',
              packages: IDENTITY_PACKAGES,
            },
            {
              to: '/notarization',
              icon: <Puzzle className="w-6 h-6 text-tawf-green" />,
              title: 'Notarization',
              desc: 'The tawf-verify stack. Batch-anchor off-chain records to Ethereum and verify them without trusting the operator.',
              packages: VERIFY_PACKAGES,
            },
          ].map((card, i) => (
            <motion.div
              key={card.to}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="p-8 bg-white rounded-2xl border border-tawf-green/10 hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 bg-tawf-green/10 rounded-full flex items-center justify-center mb-6">
                {card.icon}
              </div>
              <h2 className="font-serif text-2xl text-tawf-green mb-3">{card.title}</h2>
              <p className="text-tawf-muted leading-relaxed mb-6">{card.desc}</p>
              <ul className="space-y-2 mb-6">
                {card.packages.map(([name, desc]) => (
                  <li key={name} className="text-sm">
                    <code className="text-tawf-green font-semibold">{name}</code>
                    <span className="text-tawf-muted">: {desc}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={card.to}
                className="inline-flex items-center gap-2 text-sm font-medium tracking-widest uppercase text-tawf-green hover:text-tawf-gold transition-colors"
              >
                Read the docs <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section background="ink">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-6">Ready to integrate?</h2>
          <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
            Wire Tawf identity and notarization into your ZISWAF product in five steps.
          </p>
          <Link
            to="/integration"
            className="inline-flex items-center gap-2 bg-tawf-gold text-tawf-green px-8 py-4 rounded-full text-sm font-medium tracking-widest uppercase hover:bg-white transition-colors"
          >
            Get started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>
    </>
  );
}