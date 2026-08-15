// Finalises the ESM build in dist/esm.
//
// Two things TypeScript will not do for us:
//
//  1. The package as a whole is CommonJS, so Node reads every .js beneath it as
//     CJS. dist/esm holds real ES modules, and the marker file below is what
//     tells Node otherwise. Without it, `import '@tawf/types'` resolves to
//     dist/esm/index.js and is then parsed as CJS, failing on the first `export`.
//
//  2. tsc emits relative specifiers exactly as written in the source, so
//     `from './tid'` stays extensionless. That is fine for CommonJS, whose
//     resolver probes extensions, but real ESM requires the full path and both
//     Node and Rollup will refuse it. Rewriting here keeps the extension out of
//     the source, which matters because the source is also consumed directly by
//     the React Native entry and by the CommonJS build.
import { mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dest = resolve(here, '../dist/esm');

mkdirSync(dest, { recursive: true });
writeFileSync(resolve(dest, 'package.json'), JSON.stringify({ type: 'module' }, null, 2) + '\n');

/** Every .js file under dir, recursively. */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return full.endsWith('.js') ? [full] : [];
  });
}

// A directory import ('./core') must become './core/index.js', a file import
// ('./storage') must become './storage.js'. Checking the filesystem is what
// distinguishes them.
function specifierFor(fromFile, spec) {
  const base = resolve(dirname(fromFile), spec);
  if (existsSync(`${base}.js`)) return `${spec}.js`;
  if (existsSync(join(base, 'index.js'))) return `${spec}/index.js`;
  return null;
}

const RELATIVE = /(\bfrom\s*|\bimport\s*\(?\s*)(['"])(\.\.?\/[^'"]*)\2/g;
let rewritten = 0;

for (const file of walk(dest)) {
  const src = readFileSync(file, 'utf8');
  const out = src.replace(RELATIVE, (match, lead, quote, spec) => {
    if (/\.(js|mjs|cjs|json|node)$/.test(spec)) return match;
    const fixed = specifierFor(file, spec);
    if (!fixed) return match;
    rewritten++;
    return `${lead}${quote}${fixed}${quote}`;
  });
  if (out !== src) writeFileSync(file, out);
}

console.log(`dist/esm marked as ESM, ${rewritten} relative specifier(s) given extensions`);
