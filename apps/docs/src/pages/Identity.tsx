import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import CodeBlock from '../components/CodeBlock';

const PACKAGES = [
  ['@tawf/types', 'Shared types for TID, proofs, and chain metadata'],
  ['@tawf/wallet-sdk', 'TIDManager and Vault for React Native wallets'],
  ['@tawf/did-method', 'did:tawf resolver implementing the W3C DID method spec'],
  ['@tawf/solidity-contracts', 'TIDAttestation ERC-5192 SBT and TIDAnchor'],
  ['@tawf/compact-contracts', 'MustahikCircuit and ZK circuits on Midnight'],
  ['@tawf/bridge-relayer', 'Cross-chain message relay between chains'],
];

export default function Identity() {
  return (
    <>
      <PageHero
        badge="Identity"
        title="Tawf ID (TID)"
        subtitle="Soulbound, zero-knowledge identity"
        description="One person, one ID, one vote. Backed by ERC-5192 contracts on Ethereum and ZK proofs for sensitive claims."
        background="green"
      />

      <Section background="sand">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12 bg-tawf-gold"></div>
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-tawf-gold">Packages</span>
            <div className="h-px w-12 bg-tawf-gold"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-tawf-green mb-6">The identity stack</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PACKAGES.map(([name, desc], i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="p-7 bg-white rounded-2xl border border-tawf-green/10"
            >
              <code className="text-tawf-green font-semibold">{name}</code>
              <p className="text-tawf-muted text-sm mt-3 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section background="white">
        <div className="max-w-3xl space-y-12">
          <div>
            <h2 className="font-serif text-3xl text-tawf-green mb-6">Install</h2>
            <CodeBlock code="pnpm add @tawf/wallet-sdk @tawf/did-method @tawf/types" />
          </div>

          <div>
            <h2 className="font-serif text-3xl text-tawf-green mb-6">Create a TID</h2>
            <CodeBlock
              code={`import { TIDManager } from '@tawf/wallet-sdk';

const manager = new TIDManager();
await manager.initialize();

const tid = await manager.create({
  credentialType: 'mustahik',
  claim: { incomeThreshold: true },
});

console.log(tid.did); // did:tawf:...`}
            />
          </div>

          <div>
            <h2 className="font-serif text-3xl text-tawf-green mb-6">Resolve a DID</h2>
            <CodeBlock
              code={`import { resolve } from '@tawf/did-method';

const doc = await resolve('did:tawf:mainnet:abc123');
console.log(doc.verificationMethod);`}
            />
          </div>

          <div className="flex items-start gap-3 p-6 bg-tawf-sand/50 rounded-2xl border border-tawf-green/10">
            <ShieldCheck className="w-6 h-6 text-tawf-green shrink-0 mt-0.5" />
            <p className="text-tawf-ink/70 text-sm leading-relaxed">
              Identity contracts run on Ethereum. The soulbound token uses ERC-5192 so a TID
              can never be transferred or sold, which keeps DAO voting fair.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}