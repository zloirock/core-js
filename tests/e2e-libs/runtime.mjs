// The runtime tier, in ONE pass: for every (library x method x provider x phase) cell it builds the
// real IE11 bundle exactly once and hands that single build to every consumer - the gates, the
// injection snapshot, the node pre-flight, the artifact page and Karma. Keeping it that way is the
// whole design, and the rest of the reasoning - why the providers are paired as reference and delta,
// what gates and what only informs - is in AGENTS.md rather than repeated here.
//
// Usage:  npm run test-e2e-libs-runtime [libFilter]    OVERWRITE=1 rewrites the snapshot baselines
import { cellLabel, describeInput, runtimeBuild, wireSize, toPosix, METHODS, PROVIDERS, phasesFor, TS_SOURCE_PACKAGES, HERE } from './build.mjs';
import { positionals } from './cli.mjs';
import { checkFailureLine, discard, errorReason } from './diagnostics.mjs';
import { PAGE, bannerHarness, qunitHarness } from './harness.mjs';
import { libraries, librariesMatching } from './libraries.mjs';
import findInternetExplorer from '../karma/internet-explorer.js';

const { mkdir, readFile, rm, writeFile } = fs;
const { join, relative } = path;
const { OVERWRITE } = process.env;

const ART = join(HERE, 'artifacts');
const MANIFEST = join(ART, 'manifest.json');
const SNAP = join(HERE, 'snapshots');
const TMP = join(HERE, '.tmp');
// per process, like the temp entries and the pre-flight file: two runs split by library - the natural
// way to halve a forty-cell wait - would otherwise have the second one's startup wipe the bundles the
// first is still feeding to Karma, and the failure would name a missing file rather than any code
const KARMA_OUT = join(TMP, `karma-${ process.pid }`);

// A rejection nobody claimed ends the run either way; what this decides is what the reader gets out
// of it. node dumps the throwable raw, which for anything without a `message` is `[object Object]`,
// so the reason is turned into one line here - and the original is kept as `cause`, which node prints
// underneath with the stack this line would otherwise replace. Neither shape names the cell.
process.on('unhandledRejection', reason => {
  throw new Error(`unhandled rejection - ${ errorReason(reason) }`, { cause: reason });
});

const [libFilter] = positionals(argv, { names: ['libFilter'], usage: 'runtime.mjs takes [libFilter]' });
const libs = librariesMatching(libFilter);

// -------- consumers --------

async function baseline(file) {
  try {
    return (await readFile(file, 'utf8')).split('\n').map(l => l.trim()).filter(Boolean);
  } catch (err) {
    if (err.code === 'ENOENT') return null; // no baseline yet - first run
    throw err; // a real read error must not masquerade as "no baseline" and silently overwrite
  }
}

function snapPath(lib, provider, method, phase) {
  return join(SNAP, `${ lib.name }.${ provider }.${ method }${ phase ? `.${ phase }` : '' }.txt`);
}

// babel-plugin is the REFERENCE, stored as the set it injected; each unplugin phase is a DELTA from
// it - `-spec` for what the reference has and this phase does not, `+spec` the other way. A phase
// differs by a handful of specifiers, and a full second set would bury them in identical lines.
//
// Missing first, extra second, each sorted: stable output, and the two directions should not
// interleave.
function deltaLines(reference, injected) {
  const ref = new Set(reference);
  const now = new Set(injected);
  return [
    ...reference.filter(s => !now.has(s)).sort().map(s => `-${ s }`),
    ...injected.filter(s => !ref.has(s)).sort().map(s => `+${ s }`),
  ];
}

// Compare (or author) a cell's snapshot lines. Returns 'ok' | 'updated' | 'drift' | 'missing'.
//
// A drift prints WHERE, not just what. The lines alone ("`es.iterator.filter` is new") cannot be
// acted on: the interesting question is always which module the provider decided to inject it into,
// because that is what identifies the detection site that changed its mind. `origins` comes free out
// of the same build (see build.mjs::recorder), so this costs nothing on the passing path.
async function snapshot(file, lines, origins) {
  const base = await baseline(file);
  if (OVERWRITE) {
    // a delta can legitimately be EMPTY (the phase agrees with the reference exactly). The file is
    // still written, so "agrees" is a recorded state rather than an absent one - otherwise a
    // vanished baseline and a perfect match would look identical on the next run.
    const content = lines.length ? `${ lines.join('\n') }\n` : '';
    // write and report only what actually moved, as `tests/unplugin` and `tests/babel-plugin` do:
    // an OVERWRITE sweep across forty cells otherwise says "updated" forty times and buries the
    // handful of lines that are the reason it was run
    if (base && `${ base.join('\n') }\n`.trim() === content.trim()) return 'ok';
    await writeFile(file, content);
    echo(chalk.yellow(`    snapshot ${ base ? 'updated' : 'created' } (${ chalk.cyan(lines.length) })`));
    return 'updated';
  }
  // only an explicit OVERWRITE may author a baseline. Auto-creating one here would make a new library
  // (or a baseline lost in a merge) report success while having verified nothing.
  if (!base) {
    echo(chalk.red(`    FAIL no baseline at ${ chalk.cyan(file) } - rerun with OVERWRITE=1 to author it`));
    return 'missing';
  }
  const now = new Set(lines);
  const old = new Set(base);
  const added = lines.filter(s => !old.has(s));
  const removed = base.filter(s => !now.has(s));
  if (!added.length && !removed.length) return 'ok';
  // quoted because a delta line carries its own leading `-`/`+`, which would otherwise read as part
  // of the drift marker: `+ -core-js/modules/web.self` is two signs meaning different things
  // Both directions get their origins looked up, because in a DELTA file both can mean "injected":
  // a vanished `-spec` says this phase started injecting what the reference does, and that site is
  // exactly the question. A specifier can land in several modules; all of them are candidates for
  // the decision that changed. Strip the delta sign first - `origins` is keyed by the bare specifier,
  // and a line that this build did not inject simply has none.
  function withOrigins(mark, s) {
    echo(chalk.red(`    ${ mark } "${ chalk.cyan(s) }"`));
    for (const where of origins.get(s.replace(/^[+-]/, '')) ?? []) echo(chalk.red(`        injected into ${ chalk.cyan(where) }`));
  }
  for (const s of added) withOrigins('+', s);
  for (const s of removed) withOrigins('-', s);
  return 'drift';
}

// runs in the child, where `-e` has no module path of its own: the bundle is resolved against the cwd,
// since a bare `.tmp/x` would be read as a package name.
//
// The replacer is `jsonLossyAsText` from `diagnostics.mjs`, spelled again because nothing is imported
// here: this is where a check's `actual` crosses a process boundary, and plain `JSON.stringify` would
// turn a NaN from a broken `Math.sign`, or the `undefined` a guard produced, into `null` before any
// renderer on the far side could say otherwise. Functions and symbols go the same way.
const PREFLIGHT = 'const m = require(require("node:path").resolve(process.argv[1]));'
  + ' const run = m.run || (m.default && m.default.run) || m.default;'
  + ' Promise.resolve(run()).then(function (r) { process.stdout.write(JSON.stringify(r.checks,'
  + ' function (k, v) { if (typeof v === "number" && !isFinite(v)) return String(v);'
  + ' if (v === undefined || typeof v === "symbol") return String(v);'
  + ' return typeof v === "function" ? "[function " + (v.name || "anonymous") + "]" : v; })); })'
  + ' .catch(function (e) { process.stderr.write(String((e && e.stack) || e)); process.exit(1); });';

// Run a UMD bundle in a fresh node process (full realm, isolated) and return its `run()` checks.
// Isolation is required, not tidiness: core-js mode:full permanently patches globals, so running two
// methods in one process would let one method's injection mask another's missing one.
async function preflight(code) {
  await mkdir(TMP, { recursive: true });
  // pid as well as hrtime: hrtime reads the same monotonic clock in every process, so two concurrent
  // runs sharing this checkout could land on one path - and this file is executed, not just read
  const f = join(TMP, `preflight-${ process.pid }-${ process.hrtime.bigint() }.cjs`);
  await writeFile(f, code);
  try {
    // `node` by name and a relative path: on windows `$` runs through bash, which cannot execute an
    // absolute `C:\...`. An unsettled `run()` exits 0 with empty stdout, hence the guard below.
    const { stdout } = await $({ quiet: true, timeout: '120s' })`node -e ${ PREFLIGHT } ${ toPosix(relative(HERE, f)) }`;
    if (!stdout.trim()) throw new Error('preflight child produced no output - run() likely never settled');
    try {
      return JSON.parse(stdout);
    } catch {
      throw new Error(`preflight stdout is not JSON: ${ stdout.slice(0, 200) }`);
    }
  } finally {
    // through `discard` like every other cleanup here: this one wraps the call that PRODUCES the
    // cell's verdict, and `force` covers only ENOENT - a `.cjs` a just-exited child still holds open
    // on the windows leg raises EPERM, which would replace that verdict or redden a cell that passed
    await discard(() => rm(f, { force: true }), relative(HERE, f));
  }
}

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const HTML_ESCAPE_RE = /["&'<>]/g;
function esc(s) {
  return String(s).replaceAll(HTML_ESCAPE_RE, c => HTML_ESCAPES[c]);
}

// The in-page harness (banner target) lives in harness.mjs, shared with the Karma driver and parsed
// as ES5 at that module's load. `bannerHarness` bakes the pre-flight's label SEQUENCE in, so a page
// whose in-browser run reproduces neither those checks nor their number cannot paint itself green.
function html(title, subtitle, checks) {
  const rows = checks.map(c => `<tr class="${ c.pass ? 'ok' : 'bad' }"><td>${ esc(c.label) }</td><td>${ c.pass ? 'PASS' : 'FAIL' }</td></tr>`).join('');
  const failing = checks.filter(c => !c.pass).length;
  // ids and state classes come from `PAGE`, the same object the harness addresses - a literal here and
  // a literal there have nothing tying them together. The banner carries its own background rather
  // than taking it from a state class alone: the text is white unconditionally, so a class this
  // renderer does not define would paint white on white and the page would report nothing. The state
  // rules carry the id too: a class alone loses to it on specificity, and the banner would stay grey
  // through PASS and FAIL alike - the one channel a reader takes in before any text
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>e2e-libs ${ esc(title) }/${ esc(subtitle) }</title>
<style>
  body{font:14px/1.5 system-ui,sans-serif;margin:2rem;max-width:720px}
  #${ PAGE.banner }{padding:1rem;border-radius:8px;font-weight:700;font-size:18px;color:#fff;background:#525252}
  #${ PAGE.banner }.${ PAGE.pass }{background:#166534}#${ PAGE.banner }.${ PAGE.fail }{background:#991b1b}
  table{border-collapse:collapse;margin-top:1rem;width:100%}
  td{border:1px solid #ccc;padding:4px 8px}
  tr.ok td:nth-child(2){color:#166534;font-weight:700}
  tr.bad td:nth-child(2){color:#991b1b;font-weight:700}
</style></head>
<body>
  <h1>${ esc(title) } - <code>${ esc(subtitle) }</code></h1>
  <div id="${ PAGE.banner }">running...</div>
  <p>Pre-flight in node recorded ${ checks.length - failing }/${ checks.length } passing. This page reruns the same checks in <em>this</em> browser.</p>
  <table id="${ PAGE.table }"><thead><tr><th>check</th><th>result</th></tr></thead><tbody>${ rows }</tbody></table>
  <script src="bundle.js"></script>
  <script>${ bannerHarness(checks.map(c => c.label)) }  </script>
</body></html>
`;
}

// -------- the single pass --------

// what this run is about to rebuild, and so what it may not keep from the file below
const rebuilt = new Set(libs.map(l => l.name));
// Derived rather than curated - see `describeInput` - so a package that turns out to be the sole
// origin of a baseline line is named without anyone having noticed. Read before the manifest is, since
// the merge below keeps only cells built against the same one.
const input = await describeInput();

// What a filtered run keeps from the existing manifest, and `null` when the file itself has to go -
// the caller acts on that, so this stays a question rather than a question that also deletes.
//
// Read and validated FIRST: discovering a corrupt one after the wipe would destroy the artifacts it
// describes and every rebuilt cell with it. Read AGAIN just before writing (see the end of this file)
// - the run in between takes minutes, and a sibling filtered run finishing inside that window would
// otherwise be dropped from the file.
async function otherLibrariesInManifest() {
  if (libFilter === undefined) return [];
  try {
    const parsed = JSON.parse(await readFile(MANIFEST, 'utf8'));
    // `{ input, cells }`, not a bare array: this file outlives the run, and without the input it
    // cannot answer what it exists for - a cell is only comparable against a run fed the same packages.
    //
    // A file that parses but has another shape is STALE, not corrupt: `artifacts/` is generated and
    // gitignored, so it is one this suite wrote itself. Reported and started over, or the runner
    // refuses to run until someone deletes its own output. Unparsable still throws below - that one
    // may be a live sibling's.
    if (!Array.isArray(parsed?.cells)) {
      echo(chalk.yellow(`  ${ chalk.cyan(relative(HERE, MANIFEST)) } is from an older shape of this runner - starting a new one`));
      return null;
    }
    // and only cells fed the SAME input, all of it: the write at the end stamps this run's `input`
    // over whatever it keeps, so a cell built under another node or another version of the polyfill
    // stack would come back relabelled as this run's. The lockfile digest alone cannot answer that -
    // it covers this directory's install, and the polyfill stack resolves from the root tree.
    // Compared as text, which both sides are safe for: they come from `describeInput`, in its order.
    if (JSON.stringify(parsed.input) !== JSON.stringify(input)) {
      echo(chalk.yellow(`  ${ chalk.cyan(relative(HERE, MANIFEST)) } was built against another input - keeping only this run's cells`));
      return null;
    }
    return parsed.cells.filter(e => !rebuilt.has(e.lib));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err; // a corrupt manifest must not be silently discarded
    return [];
  }
}
// read here to throw early; the write at the end reads again. A file this run refuses to merge is
// one it also refuses to leave standing: it describes cells built from another input, beside pages
// this run is not going to rewrite, and the next reader cannot tell which are which.
if (await otherLibrariesInManifest() === null) await rm(MANIFEST, { force: true });

// Cells are only written on the success path, so without a wipe a failed cell leaves yesterday's
// all-green page on disk while the manifest records the failure. An unfiltered run therefore clears
// everything; a filtered one clears ONLY the libraries it is about to rebuild, and keeps the rest of
// the manifest through `otherLibrariesInManifest`, which the write at the end merges back in.
//
// Filtered stays per-library even when nothing was kept, because splitting a forty-cell wait across
// two filtered runs is the workflow `KARMA_OUT` is named per-process for: at the moment both start,
// neither has written the manifest yet, and a run that cleared the whole directory on that ground
// would delete the pages its sibling had just built.
if (libFilter) {
  for (const lib of libs) await rm(join(ART, lib.name), { recursive: true, force: true });
} else {
  await rm(ART, { recursive: true, force: true });
}
await rm(KARMA_OUT, { recursive: true, force: true }); // this run's own directory, see KARMA_OUT
await mkdir(KARMA_OUT, { recursive: true });
// Everything under `.tmp` is named after the process that owns it, and the bundles outlive their run
// on purpose - without IE11 here they are the whole point of the message below. What nothing did was
// collect them, and a `finally` cannot: a run killed by a signal is exactly the one that leaves its
// entry and pre-flight files behind. `.tmp` is read rather than created here because the `mkdir`
// above just made it. So each run sweeps what belongs to processes that are gone -
// `kill(pid, 0)` is the only question separating those from a live sibling's, which the per-process
// naming exists to protect.
const OWNED_BY = /-(?<pid>\d+)-\d+\.[cm]js$|^karma-(?<dirPid>\d+)$/;
for (const entry of await fs.readdir(TMP, { withFileTypes: true })) {
  const { pid, dirPid } = OWNED_BY.exec(entry.name)?.groups ?? {};
  const owner = Number(pid ?? dirPid);
  if (!owner || owner === process.pid) continue;
  let gone = false;
  try {
    process.kill(owner, 0);
  } catch (err) {
    // ESRCH is the only answer that means the pid is free. The other one, EPERM (EACCES on windows),
    // says the process is alive and someone else's - a second user running this suite in a shared
    // checkout - and treating that as gone would delete the bundles a live run is still feeding to
    // Karma. Leaving files behind is the direction that cannot break a run.
    gone = err.code === 'ESRCH';
  }
  // outside that `catch`, and through `discard`: inside it an `rm` that throws is indistinguishable
  // from `process.kill` throwing, and it fires HERE, before the first cell is built - the one
  // direction the comment above says this sweep must never take
  if (gone) await discard(() => rm(join(TMP, entry.name), { recursive: true, force: true }), entry.name);
}
await mkdir(SNAP, { recursive: true });

// Printed unconditionally, because the expensive question to answer after the fact is "was this the
// same input?" - and a snapshot that drifts between two machines is answered almost entirely by this
// plus the injection origins above.
echo(chalk.green(`environment: ${ chalk.cyan(input.environment) } | lockfile ${ chalk.cyan(input.lockfile) }`));
// the TS-source stack is called out of the same list rather than fetched separately: those packages
// are consumed as SOURCE, so they move the htmlparser2 baselines through a path none of the others do
const tsPackages = [...TS_SOURCE_PACKAGES];
echo(chalk.green(`TS sources: ${ tsPackages
  .map(p => chalk.cyan(`${ p } ${ input.packages[p] ?? '?' }`)).join(' | ') }`));
echo(chalk.green(`packages: ${ Object.entries(input.packages)
  .map(([name, v]) => chalk.cyan(`${ name } ${ v }`)).join(' | ') }`));

// PROVIDERS is ordered babel-plugin first, and the loop nests provider INSIDE method, so every
// unplugin cell runs after the reference it is diffed against - no second pass, no cross-library
// bookkeeping. Changing either the order of PROVIDERS or this nesting breaks that guarantee, which
// `reference()` below turns into a thrown error rather than a silently empty diff.
const cells = [];
for (const lib of libs) {
  for (const method of METHODS) {
    for (const provider of PROVIDERS) {
      for (const phase of phasesFor(method, provider)) cells.push({ lib, method, provider, phase });
    }
  }
}

// Only start Karma where IE11 actually exists: the windows CI runner (CI set), or a machine that has
// the browser. The resolution is `tests/karma/internet-explorer.js`, shared with the unit legs and
// the same one karma-ie-launcher performs - `IE_BIN`, then the standard location under each flavor of
// the program files directory. PATH is not among them and never mentions Internet Explorer.
// Answered HERE rather than at the leg itself, minutes later: whether the run ends in a browser is
// half of what it is about to do, and the header below is where that has to be readable.
const ie = findInternetExplorer();

// What this run is about to spend those minutes on. A matrix this size is otherwise a silent wait
// with no way to tell a full run from a filtered one, or a run that will end in IE11 from one whose
// browser leg is not even going to start.
echo(chalk.green(`\nruntime tier: ${ chalk.cyan(libs.length) } librar${ libs.length === 1 ? 'y' : 'ies' }`
  + ` x ${ chalk.cyan(METHODS.length) } method(s) x ${ chalk.cyan(PROVIDERS.length) } provider(s), phases expanded`
  + ` - ${ chalk.cyan(cells.length) } cell(s)${ libFilter ? ` filtered by ${ chalk.cyan(libFilter) }` : '' }`));
const ie11Leg = process.env.CI || ie
  ? `then ${ chalk.cyan('one page per cell') } runs in real IE11`
  : `the IE11 leg is ${ chalk.cyan('skipped') } - no IE11 here and not CI`;
echo(chalk.green(`each cell is built once, then gated, snapshotted, pre-flighted in node and written as a page; ${ ie11Leg }`));

const manifest = [];
const karmaFiles = [];
const references = new Map();
function refKey(lib, method) {
  return `${ lib.name }/${ method }`;
}
// A reference goes missing two ways, and they accuse different code: its own cell threw earlier in
// this run, or the loop stopped visiting babel-plugin first. Only the second is a defect here, so
// the failed keys are remembered and the message names the cell that actually broke.
const failedReferences = new Set();
function referenceFor(lib, method) {
  const key = refKey(lib, method);
  const set = references.get(key);
  if (set) return set;
  throw new Error(failedReferences.has(key)
    ? `the babel-plugin cell of ${ key } failed, so there is nothing to diff this phase against`
    : `no babel-plugin reference for ${ key } - cell ordering is wrong`);
}
// by LABEL, not a counter: a cell can fail its node pre-flight and then fail again in IE11, and two
// increments for one broken cell would misreport the size of the breakage in a forty-cell log
const failedCells = new Set();
let drift = 0;
let missing = 0;

for (const { lib, method, provider, phase } of cells) {
  const label = cellLabel({ name: lib.name, provider, method, phase });
  try {
    // ONE build. Everything below reads from it - the set that gets snapshotted is the set inside the
    // bundle that gets pre-flighted, measured and shipped to IE11.
    const t0 = process.hrtime.bigint();
    const { code, injected, origins } = await runtimeBuild(lib, method, phase, provider);
    // the build alone - everything below this line is deliberately outside the measurement
    const buildMs = Number(process.hrtime.bigint() - t0) / 1e6;
    // payload, no-externals and the ES5 parse are runtimeBuild's gates; this is the runner's:
    // a build that injected NOTHING has verified nothing.
    if (!injected.length) throw new Error(`${ provider } injected 0 polyfills`);

    const isReference = provider === 'babel-plugin';
    if (isReference) references.set(refKey(lib, method), injected);
    // the delta this cell diverges from the reference by. Computed for every unplugin cell - the
    // entry-global one is not snapshotted but IS asserted below, so it may not be skipped here.
    const delta = isReference ? null : deltaLines(referenceFor(lib, method), injected);

    // `entry-global` expands `import 'core-js'` into a function of `targets`/`version`/`mode` alone -
    // it never reads the library, so a per-library baseline would pin the same text four times over
    // (that set is pinned exactly, once, in tests/transpiler-fixtures/entry-global). What IS
    // library-independent and worth asserting is that the two providers agree on that expansion:
    // same inputs, same compat data, so any divergence is a bug in one of them rather than a
    // baseline to bless.
    // NB the discriminator is the METHOD, not the absence of a phase - babel-plugin's `usage-*` cells
    // carry no phase either, and those very much are snapshotted.
    let snap = 'skipped';
    if (method === 'entry-global') {
      if (!isReference) {
        if (delta.length) {
          throw new Error(`entry-global disagrees between providers (${ delta.length }): ${ delta.slice(0, 6).join(' ') }`);
        }
        snap = 'providers agree';
      }
    } else {
      snap = await snapshot(snapPath(lib, provider, method, phase), isReference ? injected : delta, origins);
      if (snap === 'drift') drift++;
      else if (snap === 'missing') missing++;
    }

    const checks = await preflight(code);
    if (!checks.length) throw new Error('exercise produced 0 checks - nothing verified');
    const bad = checks.filter(c => !c.pass);

    const bytes = Buffer.byteLength(code);
    const { min, gz } = await wireSize(code, label);

    // split back out of `label` rather than rebuilt from the same fields, so the directory and the
    // line naming it cannot drift; `cellLabel` joins on `/` and `join` puts the platform's back
    const rel = join(...label.split('/'));
    const dir = join(ART, rel);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'bundle.js'), code);
    await writeFile(join(dir, 'index.html'), html(lib.name, `${ provider } / ${ method }${ phase ? ` / ${ phase }` : '' }`, checks));

    // UMD exposes global `E2E`; each bundle gets its OWN Karma page (one file per run below), so the
    // shared global name cannot make one cell's test execute another cell's bundle.
    const karmaFile = join(KARMA_OUT, `e2e-libs-${ lib.name }-${ provider }-${ method }-${ phase ?? 'noph' }.js`);
    await writeFile(karmaFile, `${ code }\n${ qunitHarness(label, checks.map(c => c.label)) }`);
    // `pre` is unplugin's known-incomplete phase and stays advisory (see the header). Every
    // babel-plugin cell gates: it has no phase axis, so it has no expected-to-fail configuration.
    karmaFiles.push({ file: karmaFile, label, gating: phase !== 'pre' });

    // a drifting or missing baseline is a red cell, so it may not be prefixed `ok`: the run is
    // scanned by that prefix, and `exitCode` alone is no help on a log 40 cells long
    const ok = !bad.length && snap !== 'drift' && snap !== 'missing';
    if (bad.length) failedCells.add(label);
    // `providers agree` is a statement about entry-global, not about a baseline, and is the one state
    // that names itself; every other one is a snapshot's, and said so only in this file until it was
    // spelled out here - a bare `ok` in the middle of a line answers nothing without the source
    const snapshotState = snap === 'skipped' ? '' : snap === 'providers agree'
      ? `, ${ chalk.cyan(snap) }` : `, snapshot ${ chalk.cyan(snap) }`;
    echo((ok ? chalk.green : chalk.red)(`${ ok ? 'ok' : 'FAIL' } ${ chalk.cyan(label) }: `
      + `${ chalk.cyan(`${ checks.length - bad.length }/${ checks.length }`) } preflight, `
      + `${ chalk.cyan(injected.length) } injections${ delta ? ` (delta vs reference ${ chalk.cyan(delta.length) })` : '' }`
      + `${ snapshotState } `
      + `(${ chalk.cyan(bytes) }b raw / ${ chalk.cyan((gz / 1024).toFixed(0)) }KB gz, built in ${ chalk.cyan(buildMs.toFixed(0)) }ms)`));
    for (const c of bad) echo(chalk.red(`    FAIL ${ checkFailureLine(c) }`));
    manifest.push({
      lib: lib.name, provider, method, phase: phase ?? null, label, dir: rel, bytes, min, gz,
      // diagnostic, not comparable across cells - see the header
      buildMs: +buildMs.toFixed(0),
      injections: injected.length,
      // null for the reference itself; otherwise how far this phase sits from it
      deltaFromReference: delta ? delta.length : null,
      checks: checks.length, preflightFailing: bad.length,
    });
  } catch (err) {
    failedCells.add(label);
    if (provider === 'babel-plugin') failedReferences.add(refKey(lib, method));
    const reason = errorReason(err);
    echo(chalk.red(`FAIL ${ chalk.cyan(label) }: ${ reason }`));
    manifest.push({ lib: lib.name, provider, method, phase: phase ?? null, label, error: reason });
  }
}

if (!manifest.length) throw new Error('no cells ran - the registry or METHODS is empty');

await mkdir(ART, { recursive: true });
echo(chalk.green(`\nartifacts -> ${ chalk.cyan(ART) }`));
// by the manifest rather than by what is in the directory: a filtered run rebuilds its own libraries
// and leaves the others' pages where they are, so the file is what says which of them this run stands
// behind
echo(chalk.green(`Upload the page of each cell the manifest lists - ${ chalk.cyan('<lib>/<provider>/<method>[/<phase>]/index.html') },`));
echo(chalk.green(`${ chalk.cyan('bundle.js') } beside it - to BrowserStack/SauceLabs IE11 for a manual real-engine check.`));

// -------- real IE11, where one exists --------

// `ie` is resolved up at the header, which states whether this leg is going to run at all. Elsewhere
// every gate above has already run; the browser leg is the CI-only part.
const ATTEMPTS = 3;
// a browser that never starts, never reaches the karma page or drops the connection says nothing
// about the bundle - windows CI runners produce those often enough to repeat the page rather than
// redden a cell over one. The same list as in tests/karma/helpers.mjs, minus its playwright lines:
// only IE11 runs here
const INFRASTRUCTURE_FAILURES = [
  /Cannot start /, // the browser process exited before it was captured
  / crashed\./, // ... or after
  /failed \d+ times \(/, // karma gave up restarting it
  /has not captured in \d+ ms/, // it never reached the karma page
  / DISCONNECTED|Disconnected /, // it dropped the connection mid-run
];
// what the reporters spell out for a real test result, which is never repeated. Read off a stream
// karma has COLOURED - its reporter defaults to colours and does not consult a tty - and these spans
// survive that only because `@colors/colors` wraps each whole template, leaving the escapes outside:
// `green('TOTAL: %d SUCCESS')` is substituted into after it is painted. A pattern tightened to span
// what karma paints separately would stop matching a run that passed, and read as no verdict at all
const TEST_FAILURE = /\(\d+ FAILED\)|TOTAL: \d+ FAILED/;
// and its other half. Karma prints the total and only THEN tears down, which is the part that hangs
// (see the deadline below), so a child the deadline had to kill has usually already answered. A
// non-zero count, because `TOTAL: 0 SUCCESS` is a page that executed nothing
const TEST_SUCCESS = /TOTAL: [1-9]\d* SUCCESS/;

// A backstop on the karma child, not a budget for the page: the page has its own in `harness.mjs`,
// ordered under karma's `browserNoActivityTimeout`, and both sit inside this one. What this is against
// is the child that never exits at all - karma reaps IE's second process through `exec(wmic ...)`,
// which is unbounded and which karma waits on while shutting down, so a `wmic` that hangs hangs the
// job with nothing on screen. zx sets no timeout of its own, so without a number here there is none.
// Per ATTEMPT, and an attempt that hits it is not retried, so a cell spends it at most once. It has
// to sit ABOVE karma's own ladder, which `karma.conf.cjs` pins for exactly this: a capture that fails
// is retried there before karma gives up, and a bound under the sum of those attempts would fire on a
// slow runner doing nothing wrong. Ours, not zx's `timeout`: zx kills a windows child through
// `taskkill`, which leaves no signal on the object, so a deadline inferred from the exit shape is
// invisible on the one platform this leg runs on.
const KARMA_DEADLINE_MS = 300_000;
// the sweep is a windows builtin that either answers at once or is not there; it may not become the
// thing that hangs the leg it exists to protect
const SWEEP_DEADLINE = '30s';

// One page, retried while the browser rather than the bundle is what failed. Reports which of the
// two the last attempt died on, because the cell is only accused by the first: a red QUnit run is
// this suite's verdict on the floor, a browser that never started is no verdict at all.
async function runKarmaPage(bundle, label) {
  for (let attempt = 1; ; attempt++) {
    // IE spawns a second process that karma-ie-launcher only reaps through `wmic`, deprecated and
    // already gone from newer windows images, and a leftover one takes over the next launch, which
    // then exits at once as `Cannot start IE`. The sweep is blind - it takes every IE on the machine
    // - so it is limited to a CI runner, where nothing else runs one and the pages here start
    // strictly one at a time, and never touches a developer's own browser
    if (process.env.CI && ie) await $({ nothrow: true, quiet: true, timeout: SWEEP_DEADLINE })`taskkill /F /IM iexplore.exe`;

    const child = $({ nothrow: true })`karma start karma.conf.cjs -f=${ bundle }`;
    let timedOut = false;
    // both failure shapes of the kill are caught here, and neither is a verdict on this cell: zx
    // throws synchronously once the child has settled, and its windows path falls back from
    // `taskkill` to the `wmic` this deadline exists because of, which rejects. Uncaught, the first
    // ends the run from inside a timer and the second through the net at the top of this file.
    // Escalating past zx is not tidiness: this kill is the only thing between the deadline and the
    // unbounded `await` below, so one that did not happen leaves the leg with no bound at all.
    const timer = setTimeout(async () => {
      timedOut = true;
      try {
        await child.kill();
      } catch (err) {
        echo(chalk.yellow(`  ${ chalk.cyan(label) }: could not stop karma - ${ errorReason(err) }`));
        try {
          child.child?.kill('SIGKILL');
        } catch { /* nothing left to try from here - the wait below is what reports the outcome */ }
      }
    }, KARMA_DEADLINE_MS);
    let result;
    try {
      result = await child;
    } finally {
      clearTimeout(timer);
    }
    const { exitCode, signal, stdout, stderr } = result;
    if (exitCode === 0) return { exitCode, infrastructure: false, timedOut: false };

    const output = stdout + stderr;
    // The deadline fires on a karma that will not EXIT, which is a different question from whether
    // it ran the page: the teardown it hangs in comes after the reporters. A printed total is that
    // answer and is taken as one - discarding it would redden a cell IE11 passed. The exit code is
    // synthesized, since a killed child has none, and the event is said out loud and carried into
    // the manifest: reported as a plain pass, a leg where every page had to be killed reads as one
    // that ran clean.
    const failed = TEST_FAILURE.test(output);
    if (timedOut && (failed || TEST_SUCCESS.test(output))) {
      echo(chalk.yellow(`  ${ chalk.cyan(label) }: karma answered and then would not exit - killed at the deadline`));
      return { exitCode: failed ? 1 : 0, infrastructure: false, timedOut: false, deadlineKilled: true };
    }
    // a signal leaves `exitCode` null and means something outside stopped the run - neither a
    // verdict on the cell nor a browser that deserves another chance. So does our own deadline, once
    // the check above has ruled out a verdict it printed before hanging. Tracked rather than read off
    // the exit, because zx leaves no signal there on the one platform this leg runs on
    const infrastructure = !timedOut && !signal && !failed && INFRASTRUCTURE_FAILURES.some(it => it.test(output));
    if (timedOut || !infrastructure || attempt === ATTEMPTS) return { exitCode, infrastructure, timedOut };
    echo(chalk.yellow(`  ${ chalk.cyan(label) }: the browser failed to run it, retrying (${ chalk.cyan(attempt + 1) } of ${ chalk.cyan(ATTEMPTS) })`));
  }
}

// What that leg made of each cell, keyed by label. The manifest is written AFTER this section for
// exactly this reason: the leg that decides the real floor has to be in the artifact, not absent
// from it because the file was already on disk when the browser started.
const karmaOutcome = new Map();
if (!(process.env.CI || ie)) {
  echo(chalk.green(`\n${ chalk.cyan(karmaFiles.length) } bundle(s) also written to ${ chalk.cyan(KARMA_OUT) }.`
    + ' No IE11 here and not CI - skipping Karma. A windows box with IE11 in its usual place runs this leg'
    + ` by itself; ${ chalk.cyan('IE_BIN') } names it anywhere else.`));
} else {
  echo(chalk.green(`\nrunning Karma in real IE11 - ONE bundle per page (${ chalk.cyan(karmaFiles.length) } pages), so no sibling shares a realm`));
  echo(chalk.green('a global-patching method can never mask the usage-pure or pre gap of another cell, and each'));
  echo(chalk.green(`page holds a single library copy. ${ chalk.cyan('post') } + ${ chalk.cyan('pre+post') }`
    + ` (and ${ chalk.cyan('entry-global') }) GATE the job; the ${ chalk.cyan('pre') } phase is`));
  echo(chalk.green('a NON-GATING per-library diagnostic (pre runs unplugin before Babel, so it can miss Babel-helper'));
  echo(chalk.green('polyfills - expected to fail for some libraries, which is the signal we want, not a job failure).'));
  echo(chalk.green(`Per-cell counts print as ${ chalk.cyan('"[e2e-libs] <lib>/<provider>/<method>[/<phase>]: N/N checks passed"') }.`));
  for (const { file, label, gating } of karmaFiles) {
    echo(chalk.green(`\n-- IE11: ${ chalk.cyan(label) }${ gating ? '' : chalk.yellow(' [pre diagnostic, non-gating]') } --`));
    // both paths stay relative to the suite directory and forward-slashed: this leg runs on windows,
    // where `$` goes through bash - a native `D:\...` reaches it as an unquotable word - and Karma
    // matches `files` through glob, where a backslash is an escape and would match nothing
    // one IE11 page at a time, on purpose (see header) - sequential await is intended here
    const bundle = toPosix(relative(HERE, file));
    const { exitCode, infrastructure, timedOut, deadlineKilled } = await runKarmaPage(bundle, label);
    // a page the browser never ran is recorded as neither passed nor failed: the manifest is what
    // states the real floor of each cell, and `failed` there would claim IE11 gave a verdict it
    // never gave. It still reddens a gating cell below - a cell with no verdict is not a green one
    const outcome = exitCode === 0 ? 'passed'
      : timedOut ? 'no verdict - deadline'
      : infrastructure ? 'browser failed'
      : gating ? 'failed' : 'diagnostic-failed';
    // the suffix rather than a state of its own: what IE11 said is the same either way, and what
    // this adds is that karma had to be killed to say it
    karmaOutcome.set(label, deadlineKilled ? `${ outcome } - deadline` : outcome);
    if (exitCode === 0) continue;
    const how = timedOut
      ? 'karma did not exit within its budget - no verdict on this cell'
      : infrastructure
        ? `the browser failed to run it ${ chalk.cyan(ATTEMPTS) } times - no verdict on this cell`
        : `Karma exit ${ chalk.cyan(exitCode) } in real IE11`;
    // named on both branches: Karma prints its own failure above, but the tally at the end of a
    // forty-cell log has to be traceable to the cells that produced it. What gates stays the cell's
    // own axis - a `pre` page the browser never ran is no more of a job failure than the red result
    // it is allowed to produce, and a broken browser leg reddens the gating cells beside it anyway
    if (gating) {
      failedCells.add(label);
      echo(chalk.red(`  FAIL ${ chalk.cyan(label) }: ${ how }`));
    } else {
      echo(chalk.yellow(`  pre diagnostic ${ chalk.cyan(label) }: ${ how }`
        + `${ timedOut || infrastructure ? '' : ' - an expected-possible pre failure' }; not gating`));
    }
  }
}

for (const entry of manifest) entry.karma = karmaOutcome.get(entry.label) ?? 'not run';
// a filtered run keeps the entries of the libraries it did not touch, whose pages are still on disk.
// Re-read rather than reuse what was validated before the wipe: this is the last moment before the
// write, so a sibling run that finished meanwhile survives instead of being overwritten.
//
// Reported rather than thrown, unlike the read before the first cell: there an unreadable manifest
// costs nothing and stops the run early, here it would cost the whole matrix its record - the tally,
// the artifact line and every cell just built - over a file a killed sibling left half-written.
let merged = [];
try {
  // `null` here is a file written since the wipe and refused for the same reasons - a sibling on
  // another input. Nothing of it is kept, and the write below replaces it outright
  merged = await otherLibrariesInManifest() ?? [];
} catch (err) {
  echo(chalk.red(`\nFAIL could not re-read ${ chalk.cyan(relative(HERE, MANIFEST)) } - ${ errorReason(err) };`
    + ' writing this run\'s cells alone'));
  process.exitCode = 1;
}
await writeFile(MANIFEST, `${ JSON.stringify({
  input,
  scope: libFilter ?? 'all libraries',
  cells: [...merged, ...manifest],
}, null, 2) }\n`);
echo(chalk.green(`\nmanifest -> ${ chalk.cyan(MANIFEST) }`));

// A baseline with no cell behind it - a library dropped from the registry, a phase renamed - is
// invisible to everything above: nothing reads it, so nothing notices, and it sits in git looking
// like coverage. Derived from the REGISTRY rather than from this run, so a filtered run does not
// accuse the libraries it skipped.
const expectedSnapshots = new Set(libraries.flatMap(lib => METHODS.filter(m => m !== 'entry-global')
  .flatMap(method => PROVIDERS.flatMap(provider => phasesFor(method, provider)
    .map(phase => snapPath(lib, provider, method, phase))))));
const orphans = (await fs.readdir(SNAP)).map(f => join(SNAP, f)).filter(f => !expectedSnapshots.has(f));
for (const file of orphans) {
  if (OVERWRITE) await rm(file);
  echo((OVERWRITE ? chalk.yellow : chalk.red)(`${ OVERWRITE ? 'removed orphan' : 'FAIL orphan' } snapshot ${ chalk.cyan(relative(HERE, file)) }`
    + `${ OVERWRITE ? '' : ' - no cell produces it; rerun with OVERWRITE=1 to remove it' }`));
}

if (drift) echo(chalk.red(`\nFAIL injection snapshot drifted in ${ chalk.cyan(drift) } cell(s) - rerun with OVERWRITE=1 if intended`));
if (missing) echo(chalk.red(`\nFAIL ${ chalk.cyan(missing) } cell(s) have no snapshot baseline - rerun with OVERWRITE=1 to author them`));
if (failedCells.size) echo(chalk.red(`\nFAIL ${ chalk.cyan(failedCells.size) } cell(s) failed`));
if (failedCells.size || drift || missing || (orphans.length && !OVERWRITE)) process.exitCode = 1;
else echo(chalk.green(`\nruntime tier green - ${ chalk.cyan(manifest.length) } cell(s)`));
