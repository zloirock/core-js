// Injection snapshot: records WHICH core-js / @core-js/pure specifiers unplugin injects for each
// library x usage-* method, and flags drift. This uses the plain unplugin pipeline (no Babel) so the
// set is stable and comparable - it captures what unplugin does with the SOURCE, independent of Babel
// version. Babel-helper-driven injections (a function of the Babel version) are intentionally not
// snapshotted here.
//
// `entry-global` is deliberately NOT snapshotted. It never reads the library: it expands
// `import 'core-js'` into the whole set selected by `targets`, so the result is a function of
// (version, mode, targets) alone - the three per-library baselines came out BYTE-IDENTICAL, making
// the `<lib>` half of the key a fiction and tripling the diff every time core-js gains a module.
// That set is already pinned exactly, by full-text compare, in tests/transpiler-fixtures/entry-global
// (`require-root-ie11-*` pins the same 318 specifiers), which is also where a PARTIAL expansion
// regression would surface - this suite's other gates would not catch one, since `injections > 0`
// and a green exercise both survive it.
//
// Usage:  node snapshot.mjs             compare vs snapshots/<lib>.<method>.txt (fail on drift)
//         node snapshot.mjs --update    (re)write baselines
import { captureInjections, errorReason, HERE } from './build.mjs';
import { runnerArgs } from './args.mjs';
import { libraries } from './libraries.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SNAP = join(HERE, 'snapshots');
// the methods whose injected set actually derives from the library (see the header)
const METHODS = ['usage-global', 'usage-pure'];
const argv = runnerArgs(import.meta.url);
// every runner rejects an argument it does not understand; without this, `--updte` (or a library
// name, which this runner does not take) would silently run a COMPARE pass and report success
const unknown = argv.filter(a => a !== '--update');
if (unknown.length) throw new Error(`unexpected argument(s): ${ unknown.join(' ') } — snapshot.mjs takes only --update`);
// argv only. An `UPDATE=1` env var used to flip this too, which meant an ambient variable could turn
// the suite's ONLY injection-set gate from compare into author, silently: real drift got written into
// the baselines and the run still exited 0. The argv path three lines up is guarded against exactly
// that class of accident, so the env path had no business being the unguarded one.
const UPDATE = argv.includes('--update');

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
let missing = 0;
let checked = 0;
for (const lib of libraries) {
  for (const method of METHODS) {
    checked++;
    // isolate each cell: one failed capture is recorded, not fatal to the whole run
    try {
      const set = await captureInjections(lib.exercise, method);
      // a snapshot of nothing asserts nothing, and would then "match" forever — refuse to author it
      if (!set.length) throw new Error('unplugin injected 0 polyfills — refusing to snapshot an empty set');
      const file = join(SNAP, `${ lib.name }.${ method }.txt`);
      const base = await baseline(file);
      console.log(`\n=== ${ lib.name }/${ method } — ${ set.length } injected ===`);
      for (const s of set) console.log(`  ${ s }`);
      if (UPDATE) {
        await writeFile(file, `${ set.join('\n') }\n`);
        console.log(base ? `  → updated (${ set.length })` : `  → created (${ set.length })`);
        continue;
      }
      // only an explicit --update may author a baseline. Auto-creating one here would make a new
      // library (or a baseline lost in a merge) report success while having verified nothing.
      if (!base) {
        missing++;
        console.log(`  ✗ no baseline at ${ file } — rerun with --update to author it`);
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
      console.log(`\n=== ${ lib.name }/${ method } — ERROR ===\n  ${ errorReason(err) }`);
    }
  }
}
// a run that snapshotted nothing must not report success: an emptied METHODS (or an empty
// registry) would otherwise turn this gate green while verifying nothing at all
if (!checked) throw new Error('no cells snapshotted — METHODS or the library registry is empty');
if (drift) console.log(`\n✗ injection snapshot drifted in ${ drift } cell(s) — rerun with --update if intended`);
if (missing) console.log(`\n✗ ${ missing } cell(s) have no baseline — rerun with --update to author them`);
if (errored) console.log(`\n✗ ${ errored } cell(s) failed to capture`);
if (drift || missing || errored) process.exitCode = 1;
else console.log('\n✓ injection snapshot done');
