// The evaluation cache, checked where it can lie rather than where it saves time. A cache that
// answers with a stale key turns a differential run GREEN while executing nothing at all, so the
// assertions here are about the boundaries of a hit: what voids a cell (its own code moved), what
// voids a whole group (the generator rewrote that case), what voids a class of cells (the core-js
// runtime under them moved), what must never be stored (a crash sentinel), and that the AUDIT -
// the only guard against a key that lost a dimension - actually fires and actually reports.
//
// The unit half drives cache-store directly against a planted file; the shard half forks a real
// chunk twice and compares the two verdicts, which is the property the whole design rests on: a hot
// run must produce exactly what the cold one did.
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import { createHash } from 'node:crypto';
import { CACHE_MACHINERY, STRIP_DEPS } from './cache-machinery.mjs';
import { generate } from './generate.mjs';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { coverageShortfalls, emptyCoverage, skippedTotal } from './coverage.mjs';
import { buildStripScript } from './strip-manifest.mjs';
import { readRuntimeStamps } from './runtime-stamps.mjs';
import { openWorktreeCache } from './worktree-cache.mjs';

const { ensureDir, outputFile, readJson, removeSync, writeJson } = fs;
const { dirname, join } = path;
const { check, checkDeep, finish } = createChecker('differential-cache');

// NOT the ambient `__dirname`: zxi IMPORTS this file rather than running it as the entry point, so
// that global points at the bootstrap's directory
const HERE = dirname(fileURLToPath(import.meta.url));
const TMP = join(HERE, 'tmp', `cache-test-${ process.pid }`);
const CACHE = join(TMP, 'cache.json');
await ensureDir(TMP);
// on EXIT rather than at the end of the file: an assertion that throws, or a shard that dies
// mid-probe, would otherwise leave the planted fixtures behind for someone else to find
// eslint-disable-next-line node/no-sync -- an exit handler cannot await, and this is its whole point
process.on('exit', () => removeSync(TMP));

// --- unit: cell boundaries ---
// planted BEFORE the module loads: the store reads its path and its audit rate once, and the hit
// path must be asserted with the audit off - a sampled re-evaluation would make it flaky
const PLANTED = {
  round: 0,
  runtime: { pure: 'p', global: 'g' },
  cases: {
    hit: { src: 'ffffffffffffffff', 'pure-babel': { h: 'aaaaaaaaaaaaaaaa', r: 'OK|cached' } },
    moved: { src: 'ffffffffffffffff', 'pure-babel': { h: 'stale00000000000', r: 'OK|stale' } },
    rewritten: { src: 'not-the-source00', 'pure-babel': { h: 'aaaaaaaaaaaaaaaa', r: 'OK|stale' } },
  },
};
await writeJson(CACHE, PLANTED);
process.env.DIFF_CACHE = CACHE;
process.env.DIFF_AUDIT_EVERY = '0';
const store = await import('./cache-store.mjs');
const { applyRuntimeStamps, beginCase, cached, caseSrc, collectCases, discardCase, hashCode, mergeCases, mixedCase, nextRound } = store;

check('hashCode separates the TS flag', hashCode('x', true) === hashCode('x', false), false);
check('isolation changes the group address', caseSrc({ code: 'x', isolated: true }) === caseSrc({ code: 'x' }), false);
check('omitted isolation preserves shared-realm addresses', caseSrc({ code: 'x', isolated: false }), caseSrc({ code: 'x' }));
// Every foreign helper in generated source affects evaluation without changing emitter output.
const helperPaths = new Set();
for (const snippet of generate()) for (const match of snippet.code.matchAll(/["'](?<file>file:[^\s"']+)["']/gu)) {
  helperPaths.add(path.relative(HERE, fileURLToPath(match.groups.file)).replaceAll('\\', '/'));
}
check('foreign dependency census is live', helperPaths.has('../e2e-usage-pure/unbacked-window-host.cjs'), true);
for (const helper of helperPaths) check(`cache includes ${ helper }`, CACHE_MACHINERY.includes(helper), true);
const harnessSource = await fs.readFile(join(HERE, 'harness.mjs'), 'utf8');
for (const match of harnessSource.matchAll(/from '(?<dependency>@babel\/plugin-[^']+)'/gu)) {
  check(`cache includes strip dependency ${ match.groups.dependency }`, STRIP_DEPS.includes(match.groups.dependency), true);
}

// a planted cell is addressed by the hashes the store itself computes, so the fixture is built from
// them rather than from literals that would drift the moment the hashing changes
const SRC = 'export const r = 1;';
const OUT = 'import "core-js/modules/es.array.at";\nexport const r = 1;';
const srcHash = caseSrc({ code: SRC });
const outHash = hashCode(OUT);
await writeJson(CACHE, {
  round: 0,
  runtime: { pure: 'p', global: 'g' },
  cases: {
    live: { src: srcHash, native: 'OK|planted-native', 'pure-babel': { h: outHash, r: 'OK|planted-out' } },
    moved: { src: srcHash, 'pure-babel': { h: 'stale00000000000', r: 'OK|stale' } },
    rewritten: { src: 'not-the-source00', native: 'OK|stale', 'pure-babel': { h: outHash, r: 'OK|stale' } },
  },
});

async function evaluated(name, type, code, value = 'OK|fresh') {
  let ran = false;
  function evaluate() {
    ran = true;
    return value;
  }
  const key = await cached({ type, code, evaluate });
  return { ran, key, name };
}

await beginCase({ name: 'live', code: SRC });
checkDeep('a matching cell answers without evaluating', await evaluated('live', 'pure-babel', OUT), { ran: false, key: 'OK|planted-out', name: 'live' });
check('a source-code cell is stored bare', (await readJson(CACHE)).cases.live.native, 'OK|planted-native');
// same bytes, different realm: the type is what separates them, and a shared key would hand one
// realm's answer to the other
checkDeep('a second type over the SAME code evaluates', await evaluated('live', 'strip-babel', OUT, 'OK|stripped'), { ran: true, key: 'OK|stripped', name: 'live' });
checkDeep('both cells survive in the working set', [collectCases().live['pure-babel'].r, collectCases().live['strip-babel'].r], ['OK|planted-out', 'OK|stripped']);

await beginCase({ name: 'live', code: SRC, sourceType: 'script' });
check('the same source in another source goal evaluates', (await evaluated('live', 'pure-babel', OUT)).ran, true);

await beginCase({ name: 'live', code: SRC, isolated: true });
check('a formerly shared evaluation is not reused in isolation', (await evaluated('live', 'pure-babel', OUT)).ran, true);

await beginCase({ name: 'moved', code: SRC });
check('a cell whose code moved evaluates', (await evaluated('moved', 'pure-babel', OUT)).ran, true);

// the chunk PREFIX is part of the address: snippets share one realm and the corpus mutates globals
// deliberately, so the same code observes a different realm behind a different prefix. A stored group
// must not answer across that shift
await beginCase({ name: 'live', code: SRC, prefix: 'some-earlier-chunk-state' });
check('a group behind a shifted prefix is void', (await evaluated('live', 'pure-babel', OUT)).ran, true);
await beginCase({ name: 'live', code: SRC });
check('  and the unshifted one still answers', (await evaluated('live', 'pure-babel', OUT)).ran, false);

await beginCase({ name: 'rewritten', code: SRC });
check('a group whose source moved is void', (await evaluated('rewritten', 'pure-babel', OUT)).ran, true);
check('  and its source-side cell too', (await evaluated('rewritten', 'native', SRC)).ran, true);
check('  and the group carries the new src', collectCases().rewritten.src, srcHash);

// the audit takes the GROUP, never a single cell: a snippet's cells are compared against each other,
// so sampling one out of an otherwise cached group would judge a fresh value against a recorded one
await beginCase({ name: 'live', code: SRC });
checkDeep('a group is not mixed when every cell hits', [(await evaluated('live', 'pure-babel', OUT)).ran, mixedCase()], [false, false]);
checkDeep('  and mixing a miss into it is reported', [(await evaluated('live', 'strip-babel', OUT)).ran, mixedCase()], [true, true]);
// `live` forces the whole group to run even where the stored cells still match
await beginCase({ name: 'live', code: SRC, live: true });
check('a live group runs every cell', (await evaluated('live', 'pure-babel', OUT)).ran, true);
check('  and is therefore not mixed', mixedCase(), false);

// an audit disagreement has two causes and they demand opposite reactions: a REPRODUCIBLE one
// means the stored value describes a realm that no longer exists - the group is marked DRIFTED so
// the shard replays it live and believes only the live verdict; a snippet that is not a function
// of its code alone must simply never be cached. The discriminator is a second run
process.env.DIFF_AUDIT_EVERY = '1';
const auditing = await import('./cache-store.mjs?audit=1');
await auditing.beginCase({ name: 'live', code: SRC });
check('a fresh group starts undrifted', auditing.auditDrifted(), false);
let stableRuns = 0;
function reproducible() {
  stableRuns++;
  return 'OK|reproducible';
}
await auditing.cached({ type: 'pure-babel', code: OUT, evaluate: reproducible });
check('a reproducible disagreement marks the group drifted', auditing.auditDrifted(), true);
check('  after a confirming second run', stableRuns, 2);
check('  counted for the run summary', auditing.cacheStats.drifted, 1);
check('  and the fresh value is what the group now holds', auditing.collectCases().live['pure-babel'].r, 'OK|reproducible');
let drift = 0;
await auditing.beginCase({ name: 'live', code: SRC });
check('the drift flag resets with the next group', auditing.auditDrifted(), false);
await auditing.cached({ type: 'pure-babel', code: OUT, evaluate: () => `OK|drift-${ drift++ }` });
check('an unreproducible one does not mark drift', auditing.auditDrifted(), false);
check('  and its group is dropped instead of cached', auditing.collectCases().live, undefined);
check('  counted as not cacheable', auditing.cacheStats.volatile, 1);
// the drop has to survive the REST of the group: cells evaluated after it must not resurrect it
await auditing.cached({ type: 'strip-babel', code: OUT, evaluate: () => 'OK|later-cell' });
check('  and a later cell does not resurrect it', auditing.collectCases().live, undefined);
// dropping it from the working set only stops this run from WRITING it - the copy already in the
// file outlives the merge unless eviction travels as its own channel
checkDeep('  and it is reported for eviction', auditing.collectEvicted(), ['live']);
process.env.DIFF_AUDIT_EVERY = '0';

// the audit is a SAMPLE that rotates: at a rate above 1 it must take some groups and leave others,
// and a different round must take a different set. Rates 0 and 1 cannot see either property - both
// behave identically whether the sample is computed or not
async function auditedShare(rate, round) {
  const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const file = join(TMP, `sample-${ rate }-${ round }.json`);
  const cases = {};
  for (const name of names) cases[name] = { src: caseSrc({ code: name }), native: 'OK|planted' };
  await writeJson(file, { round, cases });
  process.env.DIFF_CACHE = file;
  process.env.DIFF_AUDIT_EVERY = String(rate);
  const module = await import(`./cache-store.mjs?sample=${ rate }-${ round }`);
  const taken = [];
  for (const name of names) {
    await module.beginCase({ name, code: name });
    await module.cached({ type: 'native', code: name, evaluate: () => 'OK|planted' });
    if (module.cacheStats.audited > taken.length) taken.push(name);
  }
  return taken;
}
const sampleA = await auditedShare(3, 0);
check('the audit takes a strict subset, not everything', sampleA.length > 0 && sampleA.length < 8, true);
const sampleB = await auditedShare(3, 1);
check('  and a different round takes a different set', JSON.stringify(sampleA) === JSON.stringify(sampleB), false);
process.env.DIFF_CACHE = CACHE;
process.env.DIFF_AUDIT_EVERY = '0';

await beginCase({ name: 'sentinels', code: SRC });
await cached({ type: 'global-babel', code: OUT, evaluate: () => 'WORKER-CRASH|boom' });
await cached({ type: 'global-unplugin', code: OUT, evaluate: () => 'stripped-worker-died: gone' });
checkDeep('crash sentinels are not stored', Object.keys(collectCases().sentinels), ['src']);

// a failing snippet must leave NOTHING behind. a worker that dies mid-import lands as a plain
// `ERR|Error`, indistinguishable from a snippet that legitimately throws, so a cached failure would
// pin the case red forever with a divergence nobody can reproduce by hand
await beginCase({ name: 'failing', code: SRC });
await cached({ type: 'pure-babel', code: OUT, evaluate: () => 'ERR|Error' });
discardCase('failing');
check('a failing snippet caches nothing', collectCases().failing, undefined);

// --- unit: runtime stamps ---
const STAMPED = {
  runtime: { pure: 'p', global: 'g' },
  cases: { one: { src: 's', native: 'n', arming: 'a', 'pure-babel': { h: 'x', r: 'r' }, 'global-babel': { h: 'y', r: 'r' } } },
};
checkDeep('matching stamps keep everything', applyRuntimeStamps(STAMPED, { pure: 'p', global: 'g' }).stale, []);
const purePart = applyRuntimeStamps(STAMPED, { pure: 'MOVED', global: 'g' });
checkDeep('a pure-runtime edit drops only pure cells', Object.keys(purePart.cases.one).sort(), ['arming', 'global-babel', 'native', 'src']);
const globalPart = applyRuntimeStamps(STAMPED, { pure: 'p', global: 'MOVED' });
checkDeep('a global-runtime edit drops only global cells', Object.keys(globalPart.cases.one).sort(), ['arming', 'native', 'pure-babel', 'src']);
checkDeep('  and the raw-source cells never depend on a runtime', [purePart.cases.one.native, globalPart.cases.one.arming], ['n', 'a']);

// Identical runtime content permits reuse across worktree paths without hiding a runtime edit.
const TREES = { pure: ['pure'], global: ['global/modules', 'global/internals'] };
const LEFT = join(TMP, 'left');
const RIGHT = join(TMP, 'right');
const runtimeFiles = {
  'pure/index.js': 'module.exports = 1;',
  'pure/package.json': '{ "main": "index.js" }',
  'global/modules/index.js': 'module.exports = 2;',
  'global/internals/index.js': 'module.exports = 3;',
};
for (const root of [LEFT, RIGHT]) {
  for (const [name, source] of Object.entries(runtimeFiles)) await outputFile(join(root, name), source);
}
const original = await readRuntimeStamps(LEFT, TREES);
checkDeep('a missing runtime header keeps the cache cold', (await readRuntimeStamps(LEFT, TREES, null)).compatible, { pure: undefined, global: undefined });
checkDeep('runtime stamps do not depend on directory order', (await readRuntimeStamps(LEFT, { ...TREES, global: [...TREES.global].reverse() })).runtime, original.runtime);
const relocated = await readRuntimeStamps(RIGHT, TREES, original.runtime);
checkDeep('runtime stamps survive a checkout move', relocated.runtime, original.runtime);
const runtimeCells = { ...STAMPED, runtime: original.runtime };
const afterMove = applyRuntimeStamps({ ...runtimeCells, runtime: relocated.compatible }, relocated.runtime);
checkDeep('a checkout move preserves every evaluation cell', afterMove.cases, STAMPED.cases);
checkDeep('a checkout move invalidates no runtime', afterMove.stale, []);
await outputFile(join(RIGHT, 'pure/README.md'), 'Changed documentation');
checkDeep('documentation does not invalidate runtime', (await readRuntimeStamps(RIGHT, TREES)).runtime, original.runtime);

// Reproduce the previous coordinator's stamp independently, including its absolute paths.
const legacy = {};
for (const [tree, directories] of Object.entries(TREES)) {
  const hash = createHash('sha256');
  const files = Object.keys(runtimeFiles).filter(file => directories.some(directory => file.startsWith(`${ directory }/`))).sort();
  // glob's absolute paths use forward slashes on Windows too.
  for (const file of files) hash.update(join(LEFT, file).replaceAll('\\', '/')).update('\0').update(runtimeFiles[file]).update('\0');
  legacy[tree] = hash.digest('hex').slice(0, 12);
}
const migrated = await readRuntimeStamps(LEFT, TREES, legacy);
checkDeep('matching legacy stamps preserve cells without reevaluation', migrated.compatible, original.runtime);
const foreign = await readRuntimeStamps(RIGHT, TREES, legacy);
checkDeep('unknown legacy origins cannot authorize reuse', foreign.compatible, legacy);
check('unknown legacy origins invalidate runtime cells', applyRuntimeStamps({ ...STAMPED, runtime: foreign.compatible }, foreign.runtime).stale.length, 6);

await outputFile(join(RIGHT, 'pure/package.json'), '{ "main": "other.js" }');
const manifestEdit = await readRuntimeStamps(RIGHT, TREES, original.runtime);
checkDeep('a manifest edit invalidates only its runtime', applyRuntimeStamps({ ...runtimeCells, runtime: manifestEdit.compatible }, manifestEdit.runtime).stale, purePart.stale);
await outputFile(join(LEFT, 'pure/index.js'), 'module.exports = 4;');
const contentEdit = await readRuntimeStamps(LEFT, TREES, legacy);
check('legacy stamps cannot hide a runtime edit', contentEdit.compatible.pure === contentEdit.runtime.pure, false);
check('a pure edit preserves the unchanged legacy global tree', contentEdit.compatible.global, contentEdit.runtime.global);
await fs.rename(join(RIGHT, 'global/internals/index.js'), join(RIGHT, 'global/internals/renamed.js'));
const pathEdit = await readRuntimeStamps(RIGHT, TREES, original.runtime);
check('a runtime file rename changes its stamp', pathEdit.runtime.global === original.runtime.global, false);
await outputFile(join(RIGHT, 'global/internals/extra.js'), 'module.exports = 3;');
const addedFile = await readRuntimeStamps(RIGHT, TREES);
check('an added runtime file changes its stamp', addedFile.runtime.global === pathEdit.runtime.global, false);
await fs.remove(join(RIGHT, 'global/internals/extra.js'));
check('removing the added file restores the stamp', (await readRuntimeStamps(RIGHT, TREES)).runtime.global, pathEdit.runtime.global);

// --- coordinator storage: worktree ownership and donor isolation ---
const CACHE_ROOT = join(TMP, 'owned-caches');
const TREE_A = join(TMP, 'tree-a');
const TREE_B = join(TMP, 'tree-b');
const TREE_C = join(TMP, 'tree-c');
const CACHE_NAME = 'cache-machinery-node.json';
for (const root of [TREE_A, TREE_B, TREE_C]) {
  for (const [name, source] of Object.entries(runtimeFiles)) await outputFile(join(root, name), source);
}
const ownedOptions = { directory: CACHE_ROOT, name: CACHE_NAME, trees: TREES };
const ownerA = await openWorktreeCache({ ...ownedOptions, root: TREE_A });
checkDeep('the first worktree starts cold', ownerA.stored, {});
await ownerA.write({ round: 17, cases: STAMPED.cases });
const sourceBytes = await fs.readFile(ownerA.file, 'utf8');
const brokenDonor = join(CACHE_ROOT, 'worktrees', 'broken', CACHE_NAME);
await outputFile(brokenDonor, '{ broken donor');
const ownerB = await openWorktreeCache({ ...ownedOptions, root: TREE_B });
check('another worktree has a different persistent address', ownerB.file === ownerA.file, false);
check('an absent cache borrows a matching donor', ownerB.borrowedFrom, ownerA.file);
check('borrowing preserves the audit rotation', ownerB.stored.round, 17);
checkDeep('borrowing preserves evaluations', ownerB.stored.cases, STAMPED.cases);
check('a malformed donor is skipped without changing it', await fs.readFile(brokenDonor, 'utf8'), '{ broken donor');
const snapshotB = await ownerB.snapshot(join(TMP, 'input-b.json'), ownerB.stored);
await ownerB.write({ round: 18, cases: { local: { src: 'b', native: 'own' } } });
check('writing a borrowed cache never changes the donor', await fs.readFile(ownerA.file, 'utf8'), sourceBytes);
checkDeep('workers retain their input after a persistent rewrite', (await readJson(snapshotB)).cases, STAMPED.cases);
let snapshotError;
try {
  await ownerB.snapshot(snapshotB, { round: 19, cases: {} });
} catch (error) { snapshotError = error.code; }
check('a worker input cannot be overwritten', snapshotError, 'EEXIST');
const reopenedB = await openWorktreeCache({ ...ownedOptions, root: TREE_B });
check('an existing own cache takes precedence over donors', reopenedB.borrowedFrom, null);
checkDeep('an existing own cache keeps its own results', reopenedB.stored.cases, { local: { src: 'b', native: 'own' } });
const resetB = await openWorktreeCache({ ...ownedOptions, root: TREE_B, invalidate: true });
check('explicit reset does not borrow', resetB.borrowedFrom, null);
check('explicit reset keeps its own audit counter', resetB.stored.round, 18);
await resetB.write({ round: 19, cases: {} });
check('reset never changes another worktree', await fs.readFile(ownerA.file, 'utf8'), sourceBytes);
const resetC = await openWorktreeCache({ ...ownedOptions, root: TREE_C, invalidate: true });
checkDeep('reset of a missing cache stays cold despite donors', resetC.stored, {});
check('reset of a missing cache does not borrow', resetC.borrowedFrom, null);
await outputFile(ownerB.file, '{ broken');
check('a broken own cache is not silently replaced by a donor', (await openWorktreeCache({ ...ownedOptions, root: TREE_B })).borrowedFrom, null);
await fs.remove(ownerB.file);
await outputFile(join(TREE_B, 'pure/index.js'), 'module.exports = 99;');
const incompatibleB = await openWorktreeCache({ ...ownedOptions, root: TREE_B });
checkDeep('different runtime content cannot borrow a donor', incompatibleB.stored, {});
const otherMachinery = await openWorktreeCache({ ...ownedOptions, root: TREE_C, name: 'cache-other-machinery-node.json' });
check('different machinery or Node cannot borrow a donor', otherMachinery.borrowedFrom, null);
await outputFile(join(TREE_C, 'global/modules/index.js'), 'module.exports = 99;');
checkDeep('both runtime stamps must match a donor', (await openWorktreeCache({ ...ownedOptions, root: TREE_C })).stored, {});
await outputFile(join(TREE_C, 'global/modules/index.js'), runtimeFiles['global/modules/index.js']);
await ownerB.write({ round: 20, cases: STAMPED.cases });
const staleOwnB = await openWorktreeCache({ ...ownedOptions, root: TREE_B });
check('a changed own runtime cannot trigger borrowing', staleOwnB.borrowedFrom, null);
checkDeep('a changed own runtime drops only its own dependent cells', applyRuntimeStamps(staleOwnB.stored, staleOwnB.runtime).cases, purePart.cases);
await incompatibleB.write({ round: 2, cases: { changed: { src: 'b', native: 'changed' } } });
const unchangedA = await openWorktreeCache({ ...ownedOptions, root: TREE_A });
checkDeep('a different runtime in B does not invalidate A', applyRuntimeStamps(unchangedA.stored, unchangedA.runtime).stale, []);
checkDeep('A retains its results after B changes runtime', unchangedA.stored.cases, STAMPED.cases);

// Parallel trees and same-process writers publish complete JSON; readers hold private snapshots.
await Promise.all([
  ownerA.write({ round: 20, cases: { a: { src: 'a', native: 'A' } } }),
  incompatibleB.write({ round: 21, cases: { b: { src: 'b', native: 'B' } } }),
]);
checkDeep('parallel writers remain in their own worktrees',
  [(await readJson(ownerA.file)).cases, (await readJson(incompatibleB.file)).cases],
  [{ a: { src: 'a', native: 'A' } }, { b: { src: 'b', native: 'B' } }]);
await Promise.all([ownerA.write({ round: 22, cases: { one: {} } }), ownerA.write({ round: 23, cases: { two: {} } })]);
const concurrentA = await readJson(ownerA.file);
check('same-tree concurrent writes leave one complete payload',
  (concurrentA.round === 22 && 'one' in concurrentA.cases) || (concurrentA.round === 23 && 'two' in concurrentA.cases), true);
checkDeep('concurrent writes cannot change the earlier worker snapshot', (await readJson(snapshotB)).cases, STAMPED.cases);
const ALIAS_A = join(TMP, 'alias-a');
await fs.symlink(TREE_A, ALIAS_A, process.platform === 'win32' ? 'junction' : 'dir');
check('two paths to the same real worktree share ownership', (await openWorktreeCache({ ...ownedOptions, root: ALIAS_A })).file, ownerA.file);

const oldA = join(dirname(ownerA.file), 'cache-old.json');
const oldB = join(dirname(ownerB.file), 'cache-old.json');
const flat = join(CACHE_ROOT, CACHE_NAME);
for (const file of [oldA, oldB, flat]) {
  await outputFile(file, '{}');
  await fs.utimes(file, new Date(0), new Date(0));
}
await ownerA.prune();
check('cleanup removes stale machinery only from its own tree', await fs.pathExists(oldA), false);
check('cleanup keeps other worktrees', await fs.pathExists(oldB), true);
check('cleanup keeps the legacy shared donor', await fs.pathExists(flat), true);
check('cleanup keeps the active own cache', await fs.pathExists(ownerA.file), true);

// An old flat cache is copied only after its stamps are proved; it is never rewritten in place.
const legacyDirectory = join(TMP, 'legacy-caches');
const legacyPath = join(legacyDirectory, CACHE_NAME);
const legacyStamps = await readRuntimeStamps(TREE_A, TREES);
await outputFile(legacyPath, JSON.stringify({ round: 25, runtime: legacyStamps.legacy, cases: STAMPED.cases }));
const flatBytes = await fs.readFile(legacyPath, 'utf8');
const migratedOwner = await openWorktreeCache({ ...ownedOptions, directory: legacyDirectory, root: TREE_A });
check('a proven flat legacy cache can seed an own cache', migratedOwner.borrowedFrom, legacyPath);
await migratedOwner.write(migratedOwner.stored);
check('legacy migration does not change the shared source', await fs.readFile(legacyPath, 'utf8'), flatBytes);
checkDeep('legacy migration saves portable runtime stamps', (await readJson(migratedOwner.file)).runtime, migratedOwner.runtime);

// Windows glob paths use forward slashes even though path.join returns native separators. Drive
// the same storage API with Windows paths on every OS, including a stale file as a positive control.
const hostGlobals = { fs, path, glob };
const windowsRemoved = [];
const windowsDirectory = path.win32.join('C:\\', 'cache');
const windowsName = 'cache-active.json';
const windowsDonor = path.win32.join(windowsDirectory, 'worktrees', 'donor', windowsName);
let windowsFile;
let windowsBorrowed;
try {
  globalThis.path = path.win32;
  let borrowing = false;
  globalThis.fs = {
    realpath: async root => root,
    readJson: async file => {
      if (!borrowing || path.normalize(file) === windowsDonor) return { round: 1, runtime: windowsRuntime, cases: STAMPED.cases };
      throw Object.assign(new Error('missing'), { code: 'ENOENT' });
    },
    stat: async () => ({ mtimeMs: 0 }),
    remove: async file => { windowsRemoved.push(file); },
  };
  globalThis.glob = async (pattern, options) => {
    const files = pattern === 'cache-*.json' ? [windowsName, 'cache-old.json']
      : pattern === `*/${ windowsName }` ? [`donor/${ windowsName }`] : [];
    return options.absolute ? files.map(file => path.join(options.cwd, file).replaceAll('\\', '/')) : files;
  };
  const windowsRuntime = (await readRuntimeStamps('C:\\repo', TREES)).runtime;
  const options = { root: 'C:\\repo', directory: windowsDirectory, name: windowsName, trees: TREES };
  const windowsOwner = await openWorktreeCache(options);
  windowsFile = windowsOwner.file;
  await windowsOwner.prune();
  borrowing = true;
  windowsBorrowed = (await openWorktreeCache(options)).borrowedFrom;
} finally {
  Object.assign(globalThis, hostGlobals);
}
checkDeep('Windows cleanup retains the active file and removes stale machinery', windowsRemoved, [path.win32.join(path.win32.dirname(windowsFile), 'cache-old.json')]);
check('Windows donor paths use the same identity as owned paths', windowsBorrowed, windowsDonor);

// Well-formed JSON can still hold damaged groups/cells. Preserve the healthy cells and the audit
// rather than crashing during runtime invalidation or accepting a non-string evaluation result.
const damaged = {
  round: 1.5, runtime: ownerA.runtime,
  cases: {
    ...STAMPED.cases, empty: null, array: [], noSource: { native: 'n' },
    cells: { src: 's', native: 3, arming: 'a', 'pure-babel': { h: 'x', r: null }, 'global-babel': { h: 3, r: 'r' }, 'strip-babel': [] },
  },
};
await writeJson(ownerA.file, damaged);
const repaired = await openWorktreeCache({ ...ownedOptions, root: TREE_A });
checkDeep('damaged groups and cells do not discard healthy evaluations', repaired.stored.cases, { ...STAMPED.cases, cells: { src: 's', arming: 'a' } });
check('a fractional counter cannot disable the rotating audit', repaired.stored.round, 0);
check('repair does not rewrite the cache input', (await readJson(ownerA.file)).round, 1.5);
let repairedStale;
try {
  repairedStale = applyRuntimeStamps(repaired.stored, { ...ownerA.runtime, pure: 'changed' }).cases;
} catch (error) { repairedStale = error.name; }
checkDeep('damaged cache still permits runtime invalidation', repairedStale, { ...purePart.cases, cells: { src: 's', arming: 'a' } });
for (const round of [-1, '3', null, 1e100]) {
  await writeJson(ownerA.file, { ...damaged, round, cases: STAMPED.cases });
  const reset = await openWorktreeCache({ ...ownedOptions, root: TREE_A, invalidate: true });
  check(`invalid audit counter ${ JSON.stringify(round) } restarts at zero`, reset.stored.round, 0);
  checkDeep('  without discarding healthy evaluations before explicit reset', reset.stored.cases, STAMPED.cases);
}

// --- unit: merge and liveness ---
const existing = {
  kept: { src: 's', native: 'old', 'global-babel': { h: 'g', r: 'untouched' } },
  dropped: { src: 's', native: 'old' },
};
const merged = mergeCases({
  existing,
  sets: [{ kept: { src: 's', native: 'new' } }, { unknown: { src: 's', native: 'new' } }],
  names: new Set(['kept']),
});
checkDeep('a name outside the corpus is dropped', Object.keys(merged), ['kept']);
check('a shard set overwrites the cells it carries', merged.kept.native, 'new');
checkDeep('  and leaves the cells it never touched', merged.kept['global-babel'], { h: 'g', r: 'untouched' });
const evictedOut = mergeCases({ existing, sets: [], names: new Set(['kept', 'dropped']), evicted: ['kept'] });
checkDeep('an evicted group leaves the file even when the shard wrote nothing', Object.keys(evictedOut), ['dropped']);
// manual invalidation: the file must end up holding exactly what the run computed, so a group the
// run never touched cannot survive from the stored copy
const afterReset = mergeCases({ existing, sets: [{ kept: { src: 's', native: 'new' } }], names: new Set(['kept', 'dropped']), reset: true });
checkDeep('a reset drops every stored group the run did not recompute', Object.keys(afterReset), ['kept']);
checkDeep('  and keeps what it did', afterReset.kept, { src: 's', native: 'new' });
const rewritten = mergeCases({ existing, sets: [{ kept: { src: 'MOVED', native: 'new' } }], names: new Set(['kept']) });
checkDeep('a moved src replaces the group instead of merging over it', Object.keys(rewritten.kept).sort(), ['native', 'src']);
check('the audit round advances', nextRound({ round: 3 }), 4);

// --- shard: a hot run reproduces the cold one ---
// a small slice of the real corpus, so the assertions run against real outputs and real realms
const SHARD = '0/1500';
const SHARD_TMP = join(TMP, 'shard');
const MARKER = /@@SHARD@@(?<json>.*)@@/u;
// the shard streams progress on stderr and its single result line on stdout; `quiet` keeps both out
// of the test's own output (zxi turns $.verbose on globally) while still capturing them
async function runShard({ cache = '', audit = '0', legs = 'full', emitter = 'both' } = {}) {
  const env = {
    ...process.env,
    DIFF_SHARD: SHARD,
    DIFF_TMP: SHARD_TMP,
    DIFF_LEGS: legs,
    DIFF_EMITTER: emitter,
    DIFF_CACHE: cache,
    DIFF_AUDIT_EVERY: audit,
  };
  const { stdout } = await $({ cwd: HERE, env, quiet: true })`node shard.mjs`;
  const found = MARKER.exec(stdout);
  if (!found) throw new Error('chunk produced no result');
  return JSON.parse(found.groups.json);
}
// the coverage map is compared as a whole: a hot run that quietly deep-checked fewer snippets than
// the cold one is exactly the silent-green failure the cache is dangerous for. skip keys are sorted
// because JSON comparison is key-order sensitive and theirs is insertion order
function sortedCoverage(coverage) {
  return Object.fromEntries(Object.entries(coverage).map(([leg, stats]) => {
    return [leg, { checked: stats.checked, skipped: Object.fromEntries(Object.entries(stats.skipped).sort()) }];
  }));
}
function verdictOf(result) {
  return { passed: result.passed, failures: result.failures, coverage: sortedCoverage(result.coverage) };
}
// every snippet accounted for exactly once in every leg - what the shard's own equation ships and
// the coordinator enforces against the corpus
function accountedPerLeg(result) {
  return Object.values(result.coverage).map(stats => stats.checked + skippedTotal(stats));
}

const SHARD_CACHE = join(TMP, 'shard-cache.json');
const cold = await runShard();
checkDeep('the cold run evaluates and fails nothing', [cold.cacheStats.hits, cold.failures.length], [0, 0]);
// Feed real worker results through the donor path, then replace both persistent files. Workers
// must still read the original snapshot and reproduce the cold verdict without fresh evaluations.
await ownerA.write({ round: 0, cases: cold.cases });
const shardOwner = await openWorktreeCache({ ...ownedOptions, root: TREE_C });
check('the real shard borrows the compatible tree', shardOwner.borrowedFrom, ownerA.file);
await shardOwner.snapshot(SHARD_CACHE, shardOwner.stored);
await ownerA.write({ round: 1, cases: {} });
await shardOwner.write({ round: 2, cases: {} });
const hot = await runShard({ cache: SHARD_CACHE });
checkDeep('the hot run reproduces the cold verdict', verdictOf(hot), verdictOf(cold));
check('  having evaluated nothing', hot.cacheStats.evaluated, 0);
check('  and having hit every cell the cold run wrote', hot.cacheStats.hits, cold.cacheStats.evaluated);

// fail-before for the audit: without it, a stale cell IS a silent green run
const poisoned = {};
for (const [name, group] of Object.entries(cold.cases)) {
  poisoned[name] = Object.fromEntries(Object.entries(group).map(([type, cell]) => {
    if (type === 'src') return [type, cell];
    return [type, typeof cell === 'string' ? 'OK|"poisoned"|[]' : { h: cell.h, r: 'OK|"poisoned"|[]' }];
  }));
}
await writeJson(SHARD_CACHE, { round: 0, runtime: { pure: 'p', global: 'g' }, cases: poisoned });
const unaudited = await runShard({ cache: SHARD_CACHE });
checkDeep('a poisoned cache passes silently when the audit is off', [unaudited.failures.length, unaudited.cacheStats.audited], [0, 0]);
const audited = await runShard({ cache: SHARD_CACHE, audit: '1' });
check('the audit re-evaluates every hit at rate 1', audited.cacheStats.audited, hot.cacheStats.hits);
// the poison agrees with itself, so no verdict fails - but every group DRIFTS, replays live, and
// the working set carries the live values, not the poison: the green run EXECUTED everything
check('  a self-consistent poison drifts instead of failing', audited.failures.length, 0);
check('  every audited group is counted drifted', audited.cacheStats.drifted, audited.cacheStats.audited);
checkDeep('  and the replay writes the live values back over the poison', audited.cases, cold.cases);

// the same rule end to end: poison ONE cell so the snippet's legs disagree, and the shard must
// report the divergence AND leave the whole group out of its working set. poisoning every cell
// (above) keeps them agreeing with each other, which is why that run passes silently
const desynced = {};
for (const [name, group] of Object.entries(cold.cases)) {
  desynced[name] = { ...group, native: 'OK|"desynced"|[]' };
}
await writeJson(SHARD_CACHE, { round: 0, runtime: { pure: 'p', global: 'g' }, cases: desynced });
const diverged = await runShard({ cache: SHARD_CACHE });
// every cell here comes from the cache, so the group is NOT mixed and the replay does not apply:
// the divergence is reported and nothing is written back
const stillFailing = new Set(diverged.failures.map(line => line.split(' :: ', 1)[0]));
check('a wholly cached group reports its divergence', diverged.failures.length > 0, true);
checkDeep('  and no snippet that still fails is written back', [...stillFailing].filter(name => name in diverged.cases), []);

// a MIXED group is the case the replay exists for: poison the reference AND delete one output cell,
// so the verdict would compare a recorded value against a freshly produced one. Replayed live, every
// snippet recovers - which is what discriminates the replay from its absence
const mixedCache = {};
for (const [name, group] of Object.entries(cold.cases)) {
  const copy = { ...group, native: 'OK|"poisoned-reference"|[]' };
  delete copy['pure-babel'];
  mixedCache[name] = copy;
}
await writeJson(SHARD_CACHE, { round: 0, runtime: { pure: 'p', global: 'g' }, cases: mixedCache });
const replayed = await runShard({ cache: SHARD_CACHE });
checkDeep('a mixed group is replayed live instead of believed', replayed.failures, []);
check('  and every replayed snippet is written back', Object.keys(replayed.cases).length, Object.keys(cold.cases).length);
// the replay runs both oracles a second time, so its per-snippet counters must stay per-snippet
checkDeep('  counted once, not twice', [accountedPerLeg(replayed), replayed.passed], [accountedPerLeg(cold), cold.passed]);
// NOT asserted here: that the eviction list travels shard -> marker -> merge, that a HARNESS CRASH
// drops its group, and that the coordinator honours `reset` / the corpus liveness set. All four need
// a volatile snippet or a coordinator run, and this suite forks shards only - a `[]`-shaped
// assertion would pass against a channel that carries nothing. The cycle log records them as covered
// by the full run instead of pretending otherwise

// a scoped run must write only the cells it actually computed, and must not disturb the ones it
// skipped: the edit-loop tokens are what make the cache usable mid-work, so their shape is part of
// the contract rather than a convenience
function typesOf(result) {
  const types = new Set();
  for (const group of Object.values(result.cases)) for (const type of Object.keys(group)) types.add(type);
  return [...types].sort();
}
const pureOnly = await runShard({ legs: 'pure' });
checkDeep('a pure-only run writes no usage-global cells', typesOf(pureOnly).filter(type => type.startsWith('global-')), []);
check('  and still writes the pure ones', typesOf(pureOnly).includes('pure-babel'), true);
const babelOnly = await runShard({ emitter: 'babel' });
checkDeep('a babel-only run writes no unplugin cells', typesOf(babelOnly).filter(type => type.endsWith('-unplugin')), []);
const unpluginOnly = await runShard({ emitter: 'unplugin' });
checkDeep('an unplugin-only run writes no babel cells', typesOf(unpluginOnly).filter(type => type.endsWith('-babel')), []);

const torn = join(TMP, 'torn.json');
await outputFile(torn, '{ not json');
const afterTorn = await runShard({ cache: torn });
checkDeep('a torn cache file evaluates instead of failing', verdictOf(afterTorn), verdictOf(cold));
const missing = await runShard({ cache: join(TMP, 'no-such-file.json') });
checkDeep('an absent cache file does the same', verdictOf(missing), verdictOf(cold));

check('zero corpus fails its coverage canary', coverageShortfalls(emptyCoverage(), 0).length > 0, true);
// the pure-only edit loop switches the usage-global leg off: its floor does not apply there, but a
// run that keeps the leg on may not skip under that switch, and an off leg may not skip otherwise
function coverageWith(legSkips) {
  const coverage = emptyCoverage();
  coverage['pure-stripped'].checked = 10;
  coverage['ast-print-through'].checked = 10;
  coverage['global-stripped'].skipped = legSkips;
  return coverage;
}
check('a pure-only run accounts for its switched-off leg',
  coverageShortfalls(coverageWith({ 'pure-only': 10 }), 10, { off: ['global-stripped'] }).length, 0);
check('a full run may not skip under the pure-only switch',
  coverageShortfalls(coverageWith({ 'pure-only': 10 }), 10).length > 0, true);
check('a switched-off leg may not skip for another reason',
  coverageShortfalls(coverageWith({ 'pure-only': 9, 'not-armed': 1 }), 10, { off: ['global-stripped'] }).length > 0, true);
check('source goal is part of the cache address',
  store.hashCode('var x;', false, 'script') !== store.hashCode('var x;', false, 'module'), true);
// A cleanup audit must observe a leaked property, never delete it before checking.
const realm = createContext({});
runInContext(buildStripScript([]), realm);
runInContext('Array.from = undefined;', realm);
let pollution = '';
try {
  runInContext(buildStripScript([], [], {}, true), realm);
} catch (error) {
  pollution = error.message;
}
check('realm audit detects an own-undefined leak', pollution.includes('Array.from'), true);
check('realm audit leaves the evidence intact', runInContext('"from" in Array', realm), true);
const lazyRealm = createContext({ storageReads: 0 });
runInContext(`Object.defineProperty(this, 'localStorage', { configurable: true, get() {
  storageReads++;
  return {};
} });
Object.defineProperty(this, 'lazyFeature', { configurable: true, get() {
  const value = Array.from([7])[0];
  Object.defineProperty(this, 'lazyFeature', { value, configurable: true });
  return value;
} });`, lazyRealm);
runInContext(buildStripScript([]), lazyRealm);
check('every strip consumer warms lazy host accessors before removing their primitives', runInContext('lazyFeature', lazyRealm), 7);
check('stripping does not open localStorage', lazyRealm.storageReads, 0);
check('stripping leaves localStorage available on demand', runInContext('typeof Object.getOwnPropertyDescriptor(this, "localStorage").get', lazyRealm), 'function');

const iteratorRealm = createContext({});
runInContext(`if (!Symbol.dispose) Object.defineProperty(Symbol, 'dispose', { value: Symbol('dispose') });
Object.getPrototypeOf(Object.getPrototypeOf([].values()))[Symbol.dispose] = function () {};`, iteratorRealm);
runInContext(buildStripScript([], ['Symbol.dispose']), iteratorRealm);
check('iterator disposal is stripped with the named helpers',
  runInContext('Symbol.dispose in Object.getPrototypeOf(Object.getPrototypeOf([].values()))', iteratorRealm), false);
runInContext('Object.getPrototypeOf(Object.getPrototypeOf([].values()))[Symbol.dispose] = undefined;', iteratorRealm);
let iteratorPollution = '';
try {
  runInContext(buildStripScript([], ['Symbol.dispose'], {}, true), iteratorRealm);
} catch (error) {
  iteratorPollution = error.message;
}
check('the final audit detects symbol-keyed iterator pollution', iteratorPollution.includes('%IteratorPrototype%.Symbol.dispose'), true);

// A namespace import in one evaluation must not arm another row or the other emitter.
// The ordinary shared route is the positive contamination control, not the oracle.
process.env.DIFF_TMP = TMP;
const { checkSnippet, closeStrippedWorker } = await import('./harness.mjs');
for (const [name, key] of [['map', 'groupBy'], ['promise', 'allSettled']]) {
  const options = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
  const seed = `import C from '@core-js/pure/actual/${ name }'; export const r = typeof C.${ key }; export const effects = [];`;
  await beginCase({ name: `namespace-seed/${ name }`, code: seed, live: true });
  const seeded = await checkSnippet(seed, options, false, true);
  check(`${ name }/shared worker seeded`, seeded.babelStripped, 'OK|"function"|[]');
  const code = `import C from '@core-js/pure/actual/${ name }/constructor'; export const r = Function('C', 'return typeof C.${ key }')(C); export const effects = [];`;
  for (const isolated of [false, true]) {
    await beginCase({ name: `namespace-read/${ name }/${ isolated }`, code, live: true, isolated });
    const result = await checkSnippet(code, options, false, true, 'module', isolated);
    const expected = `OK|"${ isolated ? 'undefined' : 'function' }"|[]`;
    for (const leg of ['native', 'babelRun', 'unpluginRun', 'astPrintRun', 'babelStripped', 'unpluginStripped']) {
      check(`${ name }/isolation ${ isolated }/${ leg }`, result[leg], expected);
    }
    check(`${ name }/isolated source still transforms`, result.importMismatch, false);
  }
}
closeStrippedWorker();

finish();
