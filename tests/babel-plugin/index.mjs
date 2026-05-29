// runner for the @core-js/babel-plugin fixture suite. by default uses the zx host's
// @babel/core (the v7 install at the repo root); BABEL_REQUIRE_FROM points at an
// alternate workspace dir (used by the babel@8-RC harness) so we can swap babel out
// without duplicating this script.
//
// divergence policy when BABEL_REQUIRE_FROM is set:
//   1) skip list (BABEL_SKIP, an ESM module exporting `{ '<bucket>': [...paths] }`):
//      fixtures whose v8 output cannot be expressed as a baseline match. listed entries
//      are tracked by bucket so the migration story stays inspectable.
//   2) per-fixture override: when BABEL_VARIANT is set (e.g. `babel-v8`) the runner
//      prefers a `<stem>.<variant>.<ext>` sibling for each expected file and falls back
//      to the baseline otherwise.
const { strictEqual } = require('node:assert');
const { pathToFileURL } = require('node:url');
const { createRequire } = require('node:module');

const { BABEL_REQUIRE_FROM, BABEL_SKIP, BABEL_VARIANT, OVERWRITE } = process.env;

// resolve @babel/core (and any plugin transitively loaded by name) from the requested
// workspace; without BABEL_REQUIRE_FROM fall through to plain require so the zx host's
// resolution (@babel/core@7 at the repo root) is used
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : require;
const { transformAsync } = requireBabel('@babel/core');

const { _: args } = argv;
const { access, readdir, readFile, readJson, rm, stat, writeFile } = fs;
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

// eslint-disable-next-line promise/prefer-await-to-then -- ok
const exists = file => access(file).then(() => true, () => false);

function normalizeOutput(code) {
  return code.replaceAll('\\\\', '/').replaceAll(ROOT, '<CWD>');
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

function pass(directory) {
  passed++;
  echo`${ cyan(label(directory)) } ${ green('passed') }`;
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
// this lock, a v8-errors-where-v7-succeeded fixture (error.babel-v8.txt but no output.babel-v8.mjs)
// would mis-flag the v7 baseline output.mjs as v8-stale
async function resolveExpectedSlots(directory) {
  const entries = Object.entries(EXPECTED_SLOTS);
  if (!BABEL_VARIANT) {
    return Object.fromEntries(entries.map(([key, name]) => [key, join(directory, name)]));
  }
  const variantPaths = entries.map(([, name]) => variantPath(directory, name));
  const variantHas = await Promise.all(variantPaths.map(exists));
  const locked = variantHas.some(Boolean);
  return Object.fromEntries(entries.map(([key, name], i) => [
    key, variantHas[i] || locked ? variantPaths[i] : join(directory, name),
  ]));
}

// OVERWRITE under BABEL_VARIANT targets the variant siblings only, never the v7 baseline: write
// each slot to its `<stem>.<variant>.<ext>` sibling, but when this version's whole output state
// matches the baseline drop every sibling so the fixture falls back to baseline. all-or-nothing -
// mirrors resolveExpectedSlots' lock (one sibling => the variant owns every slot). so a plain
// `OVERWRITE=1 npm run test-babel-plugin-v8` regenerates v8 variants with no manual placeholder
// and never clobbers output.mjs. `slots` is [[slotName, desiredContent | null], ...]
async function overwriteVariant(directory, slots) {
  const baseline = await Promise.all(slots.map(async ([name]) => {
    const file = join(directory, name);
    return await exists(file) ? readFile(file, UTF8) : null;
  }));
  const matchesBaseline = slots.every(([, content], i) => content === baseline[i]);
  for (const [name, content] of slots) {
    const file = variantPath(directory, name);
    if (matchesBaseline || content === null) await rm(file, { force: true });
    else await writeFile(file, content, UTF8);
  }
  return echo`${ cyan(label(directory)) } ${ matchesBaseline ? green('baseline') : yellow('variant') }`;
}

async function runFixture(directory) {
  if (skipPaths.has(label(directory))) {
    skipped++;
    return echo`${ cyan(label(directory)) } ${ yellow('skipped') }`;
  }
  const source = await readFile(join(directory, 'input.mjs'), UTF8);
  const optionsMjs = join(directory, 'options.mjs');
  const options = await exists(optionsMjs)
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
  const debugOutput = logs.length ? normalizeOutput(logs.join('\n')) : null;
  const warningsOutput = warns.length ? normalizeOutput(warns.join('\n')) : null;

  const expected = [
    [actualFile, actual],
    [debugFile, debugOutput],
    [warningsFile, warningsOutput],
  ];

  // baseline OVERWRITE writes the resolved slots directly. under BABEL_VARIANT it instead routes to
  // `overwriteVariant`, which auto-creates the variant sibling on divergence and drops it on a
  // baseline match - so a plain `OVERWRITE=1` run regenerates v8 variants without the old manual
  // `touch <stem>.<variant>.<ext>` placeholder step and never clobbers the v7 baseline
  if (OVERWRITE) {
    if (BABEL_VARIANT) return overwriteVariant(directory, [
      [EXPECTED_SLOTS.errorFile, error ? actual : null],
      [EXPECTED_SLOTS.outputFile, error ? null : actual],
      [EXPECTED_SLOTS.debugFile, debugOutput],
      [EXPECTED_SLOTS.warningsFile, warningsOutput],
    ]);
    await rm(staleFile, { force: true });
    for (const [file, content] of expected) {
      if (content !== null) await writeFile(file, content, UTF8);
      else await rm(file, { force: true });
    }
    return echo`${ cyan(label(directory)) } ${ yellow('created') }`;
  }

  if (await exists(staleFile)) {
    failed++;
    return echo(red(`${ cyan(label(directory)) } failed: ${ error ? 'unexpected error' : 'expected an error but transform succeeded' }`));
  }

  if (!await exists(actualFile)) {
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

  for (const [file, content] of expected) {
    if (content === null) {
      if (await exists(file)) {
        failed++;
        return echo(red(`${ cyan(label(directory)) } failed: unexpected ${ cyan(file) }`));
      }
      continue;
    }
    if (!await exists(file)) {
      failed++;
      return echo(red(`${ cyan(label(directory)) } failed: ${ cyan(file) } is missing`));
    }
    try {
      strictEqual(content, await readFile(file, UTF8));
    } catch (equalError) {
      failed++;
      echo(red(`${ cyan(label(directory)) } failed:`));
      return echo(equalError.message);
    }
  }

  pass(directory);
}

async function walkFixtures(directory) {
  const names = await readdir(directory);
  if (names.includes('input.mjs')) return runFixture(directory);
  for (const name of names) {
    const subdirectory = join(directory, name);
    if ((await stat(subdirectory)).isDirectory()) await walkFixtures(subdirectory);
  }
}

await walkFixtures(args.length ? `${ fixturesDir }/${ args[0] }` : fixturesDir);

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
logSummary();

if (failed) throw new Error('Some tests have failed');
