import { motion } from 'motion/react';
import { Code2 } from 'lucide-react';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import CodeBlock from '../components/CodeBlock';

const STEPS = [
  {
    title: 'Install the packages',
    body: 'Add the @tawf packages your app needs. Everything is published under the @tawf npm scope.',
    code: `pnpm add @tawf/types @tawf/wallet-sdk`,
  },
  {
    title: 'Choose a chain',
    body: 'The core runs on Ethereum. Testnets target Sepolia, and mainnet targets Arbitrum for lower gas while keeping Ethereum security.',
    code: `# testnet
export RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# mainnet (planned)
export RPC_URL=https://arb1.arbitrum.io/rpc`,
  },
  {
    title: 'Wire identity',
    body: 'Issue a soulbound TID so your users can hold a verifiable credential and vote in the DAO.',
    code: `const manager = new TIDManager();
await manager.initialize();
const tid = await manager.create({ credentialType: 'mustahik' });`,
  },
  {
    title: 'Anchor receipts',
    body: 'Notarize donation records so donors can verify them without trusting you.',
    code: `const leaf = leafHash(canonicalize(record));
const tree = buildMerkleTree([leaf]);
await anchor(tree.root);`,
  },
  {
    title: 'Publish and verify',
    body: 'Use verify-react to drop a proof badge into any React surface.',
    code: `<VerifyBadge orgId="baznas" recordId="rec_123" />`,
  },
];

export default function Integration() {
  return (
    <>
      <PageHero
        badge="Integration"
        title="Getting started"
        subtitle="Wire Tawf into your product"
        description="Integrate Tawf identity and notarization into your ZISWAF product in five steps."
        background="green"
      />

      <Section background="sand">
        <div className="max-w-3xl mx-auto space-y-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 bg-white rounded-2xl border border-tawf-green/10"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="w-10 h-10 bg-tawf-green text-tawf-sand rounded-full flex items-center justify-center text-sm font-semibold shrink-0">
                  {i + 1}
                </span>
                <h2 className="font-serif text-2xl text-tawf-green">{step.title}</h2>
              </div>
              <p className="text-tawf-muted leading-relaxed mb-5">{step.body}</p>
              <CodeBlock code={step.code} />
            </motion.div>
          ))}

          <div className="flex items-start gap-3 p-6 bg-tawf-sand/50 rounded-2xl border border-tawf-green/10">
            <Code2 className="w-6 h-6 text-tawf-green shrink-0 mt-0.5" />
            <p className="text-tawf-ink/70 text-sm leading-relaxed">
              These packages are the same ones powering the Tawf ecosystem. The
              foundation, wakaf, and verify products all import from this monorepo.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}