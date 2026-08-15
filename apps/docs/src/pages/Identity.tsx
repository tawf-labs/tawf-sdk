import { ShieldCheck } from 'lucide-react';

export default function Identity() {
  return (
    <div>
      <section className="bg-tawf-green text-tawf-sand py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-tawf-gold text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            Identity
          </p>
          <h1 className="text-4xl md:text-5xl font-light mb-4">Tawf ID (TID)</h1>
          <p className="text-tawf-sand/70 max-w-2xl leading-relaxed">
            A soulbound, zero-knowledge identity credential. One person, one ID, one vote.
            Backed by ERC-5192 contracts on Ethereum and ZK proofs for sensitive claims.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div>
            <h2 className="font-serif text-3xl text-tawf-green mb-4">Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['@tawf/types', 'Shared types for TID, proofs, and chain metadata'],
                ['@tawf/wallet-sdk', 'TIDManager and Vault for React Native wallets'],
                ['@tawf/did-method', 'did:tawf resolver implementing the W3C DID method spec'],
                ['@tawf/solidity-contracts', 'TIDAttestation ERC-5192 SBT and TIDAnchor'],
                ['@tawf/compact-contracts', 'MustahikCircuit and ZK circuits on Midnight'],
                ['@tawf/bridge-relayer', 'Cross-chain message relay between chains'],
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
{`pnpm add @tawf/wallet-sdk @tawf/did-method @tawf/types`}
            </pre>
          </div>

          <div>
            <h2 className="font-serif text-3xl text-tawf-green mb-4">Create a TID</h2>
            <pre className="bg-tawf-ink text-tawf-sand p-6 rounded-2xl overflow-x-auto text-sm leading-relaxed">
{`import { TIDManager } from '@tawf/wallet-sdk';

const manager = new TIDManager();
await manager.initialize();

const tid = await manager.create({
  credentialType: 'mustahik',
  claim: { incomeThreshold: true },
});

console.log(tid.did); // did:tawf:...`}
            </pre>
          </div>

          <div>
            <h2 className="font-serif text-3xl text-tawf-green mb-4">Resolve a DID</h2>
            <pre className="bg-tawf-ink text-tawf-sand p-6 rounded-2xl overflow-x-auto text-sm leading-relaxed">
{`import { resolve } from '@tawf/did-method';

const doc = await resolve('did:tawf:mainnet:abc123');
console.log(doc.verificationMethod);`}
            </pre>
          </div>

          <div className="flex items-start gap-3 p-6 bg-tawf-gold/10 rounded-2xl">
            <ShieldCheck className="w-6 h-6 text-tawf-green shrink-0 mt-0.5" />
            <p className="text-tawf-ink/70 text-sm leading-relaxed">
              Identity contracts run on Ethereum. The soulbound token uses ERC-5192 so a TID
              can never be transferred or sold, which keeps DAO voting fair.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}