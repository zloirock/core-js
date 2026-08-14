// runner for the @core-js/babel-plugin fixture suite. by default uses the zx host's
// @babel/core (the v8 install at the repo root, which the baseline fixtures track);
// BABEL_REQUIRE_FROM points at an alternate workspace dir (used by the babel@7 harness)
// so we can swap babel out without duplicating this script.
//
// divergence policy when BABEL_REQUIRE_FROM is set:
//   1) skip list (BABEL_SKIP, an ESM module exporting `{ '<bucket>': [...paths] }`):
//      fixtures whose alternate-babel output cannot be expressed as a baseline match.
//      listed entries are tracked by bucket so the divergence story stays inspectable.
//   2) per-fixture override: when BABEL_VARIANT is set (e.g. `babel-v7`) the runner
//      prefers a `<stem>.<variant>.<ext>` sibling for each expected file and falls back
//      to the baseline otherwise.
const { equal } = require('node:assert/strict');
const { fileURLToPath, pathToFileURL } = require('node:url');
const { createRequire } = require('node:module');

const { FIXTURE_SHARD, defaultShardCount, emitShardSummary, runShards, shardSlice } =
  await import('./fixture-shards.mjs');

const { BABEL_REQUIRE_FROM, BABEL_SKIP, BABEL_VARIANT, OVERWRITE } = process.env;

// resolve @babel/core (and any plugin transitively loaded by name) from the requested
// workspace; without BABEL_REQUIRE_FROM fall through to plain require so the zx host's
// resolution (@babel/core@7 at the repo root) is used
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : require;
const { transformAsync } = requireBabel('@babel/core');

const { _: args } = argv;
const { pathExists, readdir, readFile, readJson, rm, stat, writeFile } = fs;
const { join } = path;
const { cyan, green, red, yellow } = chalk;

const UTF8 = { encoding: 'utf8' };
const ROOT = path.resolve('../..').replaceAll('\\', '/');
// pinning options.cwd to BABEL_REQUIRE_FROM redirects babel's plugin-by-name resolution to
// that workspace's node_modules. without this, v8 babel called from cwd=tests/babel-plugin
// would walk up to the repo root and pick up the v7 transform plugins. fixtures that pin
// their own cwd take precedence
const transformCwd = BABEL_REQUIRE_FROM ? path.resolve(BABEL_REQUIRE_FROM) : null;
function withTransformCwd(options) {
  return transformCwd && options.cwd === undefined ? { ...options, cwd: transformCwd } : options;
}

// flatten skip-file buckets into one Set so the runner can skip per-fixture quickly.
// non-array bucket values are ignored (defensive against malformed input). loads via ESM
// dynamic import - matches the project's convention for config files
const skipPaths = new Set();
if (BABEL_SKIP) {
  const buckets = (await import(pathToFileURL(path.resolve(BABEL_SKIP)).href)).default;
  for (const value of Object.values(buckets)) {
    if (!Array.isArray(value)) continue;
    for (const entry of value) skipPaths.add(entry);
  }
}

function normalizeOutput(code) {
  return code.replaceAll('\\\\', '/').replaceAll(ROOT, '<CWD>');
}

// the debug `Using targets: { ... }` block can carry environment-derived, time-varying values:
// babel@8 resolves an empty/no-targets config to the `["defaults"]` browserslist query, whose
// per-browser version floors come from the installed caniuse-lite (re-resolved by `npm install`,
// NOT pinned) and shift on each release. collapse the resolved-targets JSON to a placeholder so the
// meaningful assertion (the polyfill verdict) is pinned. applied SYMMETRICALLY in both legs (and in
// the unplugin runner): the baseline debug.txt is stored collapsed, so the v7 variant leg must
// collapse its actual too, else every explicit-targets debug fixture spuriously needs a
// `debug.babel-v7.txt` (and an all-or-nothing `output.babel-v7.mjs`). explicit targets do not drift,
// so collapsing them only drops a debug assertion the output already reflects
function normalizeDriftingTargets(text) {
  if (text === null) return text;
  return text.replace(/Using targets: \{[^}]*\}/, 'Using targets: <RESOLVED>');
}

// hijack console.log + warn + error so untracked diagnostics don't leak past the runner.
// returns the captured-buffer arrays plus a `restore` callback for the finally block.
// error shares the warnings channel since neither plugin emitter distinguishes severity
function captureConsole() {
  const logs = [];
  const warns = [];
  const orig = { log: console.log, warn: console.warn, error: console.error };
  console.log = (...a) => logs.push(a.map(String).join(' '));
  console.warn = (...a) => warns.push(a.map(String).join(' '));
  console.error = (...a) => warns.push(a.map(String).join(' '));
  return { logs, warns, restore: () => Object.assign(console, orig) };
}

const fixturesDir = '../transpiler-fixtures';

let passed = 0;
let failed = 0;
let skipped = 0;

function label(directory) {
  return path.relative(fixturesDir, directory);
}

// counted silently - with 8k+ fixtures the per-pass line drowns the failures
function pass() {
  passed++;
}

// the 4 expected-output slots a fixture may produce; mapped to friendly keys for downstream
// destructuring. order is irrelevant
const EXPECTED_SLOTS = {
  errorFile: 'error.txt',
  outputFile: 'output.mjs',
  debugFile: 'debug.txt',
  warningsFile: 'warnings.txt',
};

function variantPath(directory, baseName) {
  const dot = baseName.lastIndexOf('.');
  return join(directory, `${ baseName.slice(0, dot) }.${ BABEL_VARIANT }${ baseName.slice(dot) }`);
}

// resolves all 4 expected paths for a fixture. without BABEL_VARIANT each slot is the baseline.
// under variant mode the rule is all-or-nothing per fixture: if ANY variant sibling exists, the
// variant declares the full expected state - missing variant siblings still resolve to variant
// paths (so stale-file checks compare against the variant's view, not the baseline). without
// this lock, a v7-errors-where-v8-succeeded fixture (error.babel-v7.txt but no output.babel-v7.mjs)
// would mis-flag the v8 baseline output.mjs as v7-stale
async function resolveExpectedSlots(directory) {
  const entries = Object.entries(EXPECTED_SLOTS);
  if (!BABEL_VARIANT) {
    return Object.fromEntries(entries.map(([key, name]) => [key, join(directory, name)]));
  }
  const variantPaths = entries.map(([, name]) => variantPath(directory, name));
  const variantHas = await Promise.all(variantPaths.map(pathExists));
  const locked = variantHas.some(Boolean);
  return Object.fromEntries(entries.map(([key, name], i) => [
    key, variantHas[i] || locked ? variantPaths[i] : join(directory, name),
  ]));
}

// OVERWRITE under BABEL_VARIANT targets the variant siblings only, never the v8 baseline: write
// each slot to its `<stem>.<variant>.<ext>` sibling, but when this version's whole output state
// matches the baseline drop every sibling so the fixture falls back to baseline. all-or-nothing -
// mirrors resolveExpectedSlots' lock (one sibling => the variant owns every slot). so a plain
// `OVERWRITE=1 npm run test-babel-plugin-v7` regenerates v7 variants with no manual placeholder
// and never clobbers output.mjs. `slots` is [[slotName, desiredContent | null], ...]
async function overwriteVariant(directory, slots) {
  const baseline = await Promise.all(slots.map(async ([name]) => {
    const file = join(directory, name);
    return await pathExists(file) ? readFile(file, UTF8) : null;
  }));
  const matchesBaseline = slots.every(([, content], i) => content === baseline[i]);
  // touch (and report) only what actually changes - an OVERWRITE sweep over thousands of
  // untouched fixtures must stay silent so the real regen deltas are the whole output
  let changed = false;
  for (const [name, content] of slots) {
    const file = variantPath(directory, name);
    const desired = matchesBaseline || content === null ? null : content;
    const previous = await pathExists(file) ? await readFile(file, UTF8) : null;
    if (previous === desired) continue;
    changed = true;
    if (desired === null) await rm(file, { force: true });
    else await writeFile(file, desired, UTF8);
  }
  if (changed) echo`${ cyan(label(directory)) } ${ matchesBaseline ? green('baseline') : yellow('variant rewritten') }`;
}

async function runFixture(directory) {
  if (skipPaths.has(label(directory))) {
    skipped++;
    return;
  }
  const source = await readFile(join(directory, 'input.mjs'), UTF8);
  const optionsMjs = join(directory, 'options.mjs');
  const options = await pathExists(optionsMjs)
    ? (await import(pathToFileURL(path.resolve(optionsMjs)).href)).default
    : await readJson(join(directory, 'options.json'), UTF8);
  const { errorFile, outputFile, debugFile, warningsFile } = await resolveExpectedSlots(directory);

  const { logs, warns, restore } = captureConsole();

  let result, error;
  try {
    result = normalizeOutput((await transformAsync(source, withTransformCwd(options))).code);
  } catch (transformError) {
    error = transformError;
  } finally {
    restore();
  }

  const actualFile = error ? errorFile : outputFile;
  const staleFile = error ? outputFile : errorFile;
  const actual = error ? normalizeOutput(error.message) : result;
  const debugOutput = normalizeDriftingTargets(logs.length ? normalizeOutput(logs.join('\n')) : null);
  const warningsOutput = warns.length ? normalizeOutput(warns.join('\n')) : null;

  // the debug slot carries `normalizeDriftingTargets` so the EXPECTED fixture content gets the same
  // resolved-targets collapse the actual went through - keeps both comparison sides aligned in the
  // default (babel@8) run without touching the variant leg (a no-op normalizer there)
  const expected = [
    [actualFile, actual],
    [debugFile, debugOutput, normalizeDriftingTargets],
    [warningsFile, warningsOutput],
  ];

  // baseline OVERWRITE writes the resolved slots directly. under BABEL_VARIANT it instead routes to
  // `overwriteVariant`, which auto-creates the variant sibling on divergence and drops it on a
  // baseline match - so a plain `OVERWRITE=1` run regenerates v7 variants without the old manual
  // `touch <stem>.<variant>.<ext>` placeholder step and never clobbers the v8 baseline
  if (OVERWRITE) {
    if (BABEL_VARIANT) return overwriteVariant(directory, [
      [EXPECTED_SLOTS.errorFile, error ? actual : null],
      [EXPECTED_SLOTS.outputFile, error ? null : actual],
      [EXPECTED_SLOTS.debugFile, debugOutput],
      [EXPECTED_SLOTS.warningsFile, warningsOutput],
    ]);
    // touch (and report) only what actually changes - the regen deltas ARE the output
    let changed = await pathExists(staleFile);
    await rm(staleFile, { force: true });
    for (const [file, content] of expected) {
      const previous = await pathExists(file) ? await readFile(file, UTF8) : null;
      if (previous === content) continue;
      changed = true;
      if (content !== null) await writeFile(file, content, UTF8);
      else await rm(file, { force: true });
    }
    if (changed) echo`${ cyan(label(directory)) } ${ yellow('rewritten') }`;
    return;
  }

  if (await pathExists(staleFile)) {
    failed++;
    return echo(red(`${ cyan(label(directory)) } failed: ${ error ? 'unexpected error' : 'expected an error but transform succeeded' }`));
  }

  if (!await pathExists(actualFile)) {
    // variant runs never auto-create baselines: the override file must be an explicit
    // decision per-fixture. baseline runs auto-create so adding a fresh fixture works
    if (BABEL_VARIANT) {
      failed++;
      return echo(red(`${ cyan(label(directory)) } failed: ${ cyan(actualFile) } is missing`));
    }
    for (const [file, content] of expected) {
      if (content !== null) await writeFile(file, content, UTF8);
    }
    return echo`${ cyan(label(directory)) } ${ yellow('created') }`;
  }

  for (const [file, content, normalizeExpected = x => x] of expected) {
    if (content === null) {
      if (await pathExists(file)) {
        failed++;
        return echo(red(`${ cyan(label(directory)) } failed: unexpected ${ cyan(file) }`));
      }
      continue;
    }
    if (!await pathExists(file)) {
      failed++;
      return echo(red(`${ cyan(label(directory)) } failed: ${ cyan(file) } is missing`));
    }
    try {
      equal(content, normalizeExpected(await readFile(file, UTF8)));
    } catch (equalError) {
      failed++;
      echo(red(`${ cyan(label(directory)) } failed:`));
      return echo(equalError.message);
    }
  }

  pass();
}

// the walk COLLECTS (sorted - readdir order is OS-dependent and the shard slices must be
// identical across processes), the run loop below dispatches
async function collectFixtures(directory, out = []) {
  const names = (await readdir(directory)).sort();
  if (names.includes('input.mjs')) {
    out.push(directory);
    return out;
  }
  for (const name of names) {
    const subdirectory = join(directory, name);
    if ((await stat(subdirectory)).isDirectory()) await collectFixtures(subdirectory, out);
  }
  return out;
}

// a shard child receives the subtree filter via env (the zx CLI keeps the script name in
// argv._, so a positional arg would land off-by-one against the zxi-invoked parent)
const subtree = FIXTURE_SHARD ? process.env.FIXTURE_SUBTREE : args[0];
const fixtures = await collectFixtures(subtree ? `${ fixturesDir }/${ subtree }` : fixturesDir);

// a child reports through the marker only; the parent aggregates and decides the exit
if (FIXTURE_SHARD) {
  for (const directory of shardSlice(fixtures)) await runFixture(directory);
  emitShardSummary({ passed, failed, skipped });
} else {
  const shards = defaultShardCount(fixtures.length);
  echo(green(`babel-plugin fixtures: ${ cyan(fixtures.length) } in ${ cyan(shards) } shard(s); only failures and rewrites are printed below`));
  if (shards > 1) {
    ({ passed = 0, failed = 0, skipped = 0 } = await runShards({
      script: fileURLToPath(import.meta.url),
      shards,
      extraEnv: subtree ? { FIXTURE_SUBTREE: subtree } : {},
    }));
  } else {
    for (const directory of fixtures) await runFixture(directory);
  }
  logSummary();
  if (failed) throw new Error('Some tests have failed');
}

// alternate-workspace runs prefix the summary with the resolved babel version and append
// a Skipped count; default v7 path keeps the original concise two-line shape
function logSummary() {
  if (BABEL_REQUIRE_FROM) {
    const { version } = requireBabel('@babel/core/package.json');
    echo(`\nBabel: ${ cyan(version) }`);
  }
  const passedLabel = green(passed);
  const failedLabel = failed ? red(failed) : green(failed);
  const skippedTail = BABEL_REQUIRE_FROM
    ? `, Skipped: ${ skipped ? yellow(skipped) : green(skipped) }`
    : '';
  echo(`${ BABEL_REQUIRE_FROM ? '' : '\n' }Passed: ${ passedLabel }, Failed: ${ failedLabel }${ skippedTail }`);
}
