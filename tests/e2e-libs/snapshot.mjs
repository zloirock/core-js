// Injection snapshot: records WHICH core-js / @core-js/pure specifiers unplugin injects for each
// library x method, and flags drift. This uses the plain unplugin pipeline (no Babel) so the set
// is stable and comparable - it captures what unplugin does with the SOURCE, independent of Babel
// version. Babel-helper-driven injections (a function of the Babel version) are intentionally not
// snapshotted here.
//
// Usage:  node snapshot.mjs             compare vs snapshots/<lib>.<method>.txt (fail on drift)
//         node snapshot.mjs --update    (re)write baselines
import { captureInjections } from './build.mjs';
import { libraries } from './libraries.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SNAP = join(HERE, 'snapshots');
const UPDATE = process.argv.includes('--update') || process.env.UPDATE === '1';

async function baseline(file) {
  try {
    return (await readFile(file, 'utf8')).split('\n').map(l => l.trim()).filter(Boolean);
  } catch (err) {
    if (err.code === 'ENOENT') return null; // no baseline yet — first run
    throw err; // a real read error must not masquerade as "no baseline" and silently overwrite
  }
}

await mkdir(SNAP, { recursive: true });
let drift = 0;
let errored = 0;
for (const lib of libraries) {
  for (const method of lib.methods) {
    // isolate each cell: one failed capture is recorded, not fatal to the whole run
    try {
      const set = await captureInjections(lib.exercise, method);
      const file = join(SNAP, `${ lib.name }.${ method }.txt`);
      const base = await baseline(file);
      console.log(`\n=== ${ lib.name }/${ method } — ${ set.length } injected ===`);
      for (const s of set) console.log(`  ${ s }`);
      if (UPDATE || !base) {
        await writeFile(file, `${ set.join('\n') }\n`);
        console.log(base ? `  → updated (${ set.length })` : `  → created (${ set.length })`);
        continue;
      }
      const now = new Set(set);
      const old = new Set(base);
      const added = set.filter(s => !old.has(s));
      const removed = base.filter(s => !now.has(s));
      if (!added.length && !removed.length) {
        console.log('  ✓ matches baseline');
      } else {
        drift++;
        for (const s of added) console.log(`  + ${ s }  (new)`);
        for (const s of removed) console.log(`  - ${ s }  (gone)`);
      }
    } catch (err) {
      errored++;
      console.log(`\n=== ${ lib.name }/${ method } — ERROR ===\n  ${ (err.message || String(err)).split('\n', 1)[0] }`);
    }
  }
}
if (drift) console.log(`\n✗ injection snapshot drifted in ${ drift } cell(s) — rerun with --update if intended`);
if (errored) console.log(`\n✗ ${ errored } cell(s) failed to capture`);
if (drift || errored) process.exitCode = 1;
else console.log('\n✓ injection snapshot done');
