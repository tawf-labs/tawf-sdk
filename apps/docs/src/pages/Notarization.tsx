import { motion } from 'motion/react';
import { Puzzle } from 'lucide-react';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import CodeBlock from '../components/CodeBlock';

const PACKAGES = [
  ['@tawf/verify-core', 'Canonicalization, Merkle hashing, proof verification. Isomorphic with zero network calls'],
  ['@tawf/verify-server', 'Record buffering, batch scheduling, and anchor submission'],
  ['@tawf/verify-react', 'VerifyBadge, VerifyPanel, and TransparencyBoard components'],
  ['@tawf/verify-cli', 'The tawf-verify command line for operator-side audit and prove'],
];

export default function Notarization() {
  return (
    <>
      <PageHero
        badge="Notarization"
        title="tawf-verify"
        subtitle="A notary, not a custodian"
        description="Batch-anchor off-chain records to Ethereum and let donors verify a receipt without trusting the operator."
        background="green"
      />

      <Section background="sand">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12 bg-tawf-gold"></div>
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-tawf-gold">Packages</span>
            <div className="h-px w-12 bg-tawf-gold"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-tawf-green mb-6">The notarization stack</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PACKAGES.map(([name, desc], i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
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
            <CodeBlock code={"# not on npm yet\npnpm add @tawf/verify-core @tawf/verify-react"} />
          </div>

          <div>
            <h2 className="font-serif text-3xl text-tawf-green mb-6">Record and prove</h2>
            <CodeBlock
              code={`import { canonicalize, leafHash, buildMerkleTree } from '@tawf/verify-core';

const record = { amount: '100000', currency: 'IDR', recipient: 'school-12' };
const leaf = leafHash(canonicalize(record));

const tree = buildMerkleTree([leaf, otherLeaf]);
const proof = tree.getProof(leaf);
console.log(tree.root); // anchored to Ethereum`}
            />
          </div>

          <div>
            <h2 className="font-serif text-3xl text-tawf-green mb-6">Embed a verify badge</h2>
            <CodeBlock
              code={`import { VerifyBadge } from '@tawf/verify-react';

export function Receipt() {
  return <VerifyBadge orgId="baznas" recordId="rec_123" />;
}`}
            />
          </div>

          <div className="flex items-start gap-3 p-6 bg-tawf-sand/50 rounded-2xl border border-tawf-green/10">
            <Puzzle className="w-6 h-6 text-tawf-green shrink-0 mt-0.5" />
            <p className="text-tawf-ink/70 text-sm leading-relaxed">
              The chain stores only a keccak256 fingerprint of each record. No token is
              minted and no personal data reaches the chain by default.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}