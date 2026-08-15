import { Code2 } from 'lucide-react';

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
    <div>
      <section className="bg-tawf-green text-tawf-sand py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-tawf-gold text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            Integration
          </p>
          <h1 className="text-4xl md:text-5xl font-light mb-4">Getting started</h1>
          <p className="text-tawf-sand/70 max-w-2xl leading-relaxed">
            Wire Tawf identity and notarization into your ZISWAF product in five steps.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          {STEPS.map((step, i) => (
            <div key={step.title} className="p-8 bg-white rounded-2xl border border-tawf-green/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 bg-tawf-green text-tawf-sand rounded-full flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </span>
                <h2 className="font-serif text-2xl text-tawf-green">{step.title}</h2>
              </div>
              <p className="text-tawf-muted leading-relaxed mb-4">{step.body}</p>
              <pre className="bg-tawf-ink text-tawf-sand p-5 rounded-xl overflow-x-auto text-sm leading-relaxed">
{step.code}
              </pre>
            </div>
          ))}

          <div className="flex items-start gap-3 p-6 bg-tawf-gold/10 rounded-2xl">
            <Code2 className="w-6 h-6 text-tawf-green shrink-0 mt-0.5" />
            <p className="text-tawf-ink/70 text-sm leading-relaxed">
              These packages are the same ones powering the Tawf ecosystem. The
              foundation, wakaf, and verify products all import from this monorepo.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}