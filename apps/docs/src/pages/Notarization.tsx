import { Puzzle } from 'lucide-react';

export default function Notarization() {
  return (
    <div>
      <section className="bg-tawf-green text-tawf-sand py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-tawf-gold text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            Notarization
          </p>
          <h1 className="text-4xl md:text-5xl font-light mb-4">tawf-verify</h1>
          <p className="text-tawf-sand/70 max-w-2xl leading-relaxed">
            A notary, not a custodian. Batch-anchor off-chain records to Ethereum and let
            donors verify a receipt without trusting the operator.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div>
            <h2 className="font-serif text-3xl text-tawf-green mb-4">Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['@tawf/verify-core', 'Canonicalization, Merkle hashing, proof verification. Isomorphic with zero network calls'],
                ['@tawf/verify-server', 'Record buffering, batch scheduling, and anchor submission'],
                ['@tawf/verify-react', 'VerifyBadge, VerifyPanel, and TransparencyBoard components'],
                ['@tawf/verify-cli', 'The tawf-verify command line for operator-side audit and prove'],
              ].map(([name, desc]) => (
                <div key={name} className="p-6 bg-white rounded-2xl border border-tawf-green/10">
                  <code className="text-tawf-green font-semibold">{name}</code>
                  <p className="text-tawf-muted text-sm mt-2 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-serif text-3xl text-tawf-green mb-4">Install</h2>
            <pre className="bg-tawf-ink text-tawf-sand p-6 rounded-2xl overflow-x-auto text-sm leading-relaxed">
{`pnpm add @tawf/verify-core @tawf/verify-react`}
            </pre>
          </div>

          <div>
            <h2 className="font-serif text-3xl text-tawf-green mb-4">Record and prove</h2>
            <pre className="bg-tawf-ink text-tawf-sand p-6 rounded-2xl overflow-x-auto text-sm leading-relaxed">
{`import { canonicalize, leafHash, buildMerkleTree } from '@tawf/verify-core';

const record = { amount: '100000', currency: 'IDR', recipient: 'school-12' };
const leaf = leafHash(canonicalize(record));

const tree = buildMerkleTree([leaf, otherLeaf]);
const proof = tree.getProof(leaf);
console.log(tree.root); // anchored to Ethereum`}
            </pre>
          </div>

          <div>
            <h2 className="font-serif text-3xl text-tawf-green mb-4">Embed a verify badge</h2>
            <pre className="bg-tawf-ink text-tawf-sand p-6 rounded-2xl overflow-x-auto text-sm leading-relaxed">
{`import { VerifyBadge } from '@tawf/verify-react';

export function Receipt() {
  return <VerifyBadge orgId="baznas" recordId="rec_123" />;
}`}
            </pre>
          </div>

          <div className="flex items-start gap-3 p-6 bg-tawf-gold/10 rounded-2xl">
            <Puzzle className="w-6 h-6 text-tawf-green shrink-0 mt-0.5" />
            <p className="text-tawf-ink/70 text-sm leading-relaxed">
              The chain stores only a keccak256 fingerprint of each record. No token is
              minted and no personal data reaches the chain by default.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}