import { parseSync } from 'oxc-parser';
import { LEAST_UPPER_BOUND, TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { liftSfcLangSuffix } from '../../packages/core-js-unplugin/internals/plugin-helpers.js';
import { strip } from './structural.mjs';
import { extractPluginOptions, inferTestId, loadBabelOptions, normalizeMachinePaths, shouldSkip } from './fixture-lang.mjs';
import { fileURLToPath } from 'node:url';
import {
  FIXTURE_SHARD, defaultShardCount, emitShardSummary, runShards, shardSlice,
} from '../babel-plugin/fixture-shards.mjs';

const { readdir, pathExists, readFile, rm, stat, writeFile } = fs;
const { basename, join } = path;
const { cyan, green, red, yellow } = chalk;

const { OVERWRITE } = process.env;
const { _: args } = argv;
const UTF8 = { encoding: 'utf8' };
const fixturesDir = path.resolve('../transpiler-fixtures');

const counts = { passed: 0, failed: 0, skipped: 0 };

// OVERWRITE sweeps run over thousands of untouched fixtures - write (and report) only what
// actually changes so the regen deltas are the whole output. returns whether it changed
async function writeIfChanged(directory, file, content) {
  const previous = await pathExists(file) ? await readFile(file, UTF8) : null;
  if (previous === content) return false;
  if (content === null) await rm(file, { force: true });
  else await writeFile(file, content, UTF8);
  echo`${ cyan(label(directory)) } ${ yellow(content === null ? 'removed' : 'rewritten') } ${ cyan(basename(file)) }`;
  return true;
}

function normalize(code) {
  return normalizeMachinePaths(code).trim();
}

// collapse the debug `Using targets: { ... }` block to a placeholder - mirrors the babel-plugin
// runner's `normalizeDriftingTargets`. the babel runner applies it to the shared debug.txt baseline
// (babel@8 no-targets resolves to a drifting `["defaults"]` set), so the unplugin debug must collapse
// the same line or every targets-bearing debug fixture would spuriously diverge from the baseline
function collapseDriftingTargets(text) {
  return text === null ? text : text.replace(/Using targets: \{[^}]*\}/, 'Using targets: <RESOLVED>');
}

// fixtures whose babel BASELINE bakes an @babel/generator defect (EDGE row in the queue):
// the body compare would hold our correct print to a wrong baseline - the import-set
// assertion still stands. paired manifestation: cast-under-update baselines do not parse
// at all and take the same lane through the parse check
const BASELINE_GENERATOR_DEFECTS = new Set([
  // `(f || g)<string>` printed as `f || g<string>` - the instantiation reassociates onto `g`
  'ts-instantiation-host-priority-parens',
]);

function parseOrNull(parseId, source) {
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const parsed = parseSync(parseId, source, { sourceType: 'module' });
  return parsed.errors?.some(error => error.severity === 'Error') ? null : parsed;
}

// the injected-polyfill set for the imports-only loose lanes, BOTH spellings: usage-global
// writes a BARE `import "core-js/modules/..."` (or a side-effect `require(...)`), usage-pure
// a DEFAULT import off `@core-js/pure`. the two package names normalize together, as the
// differential's own extractor does
function importsOf(text) {
  const found = text.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('import') && !trimmed.includes('require(')) return null;
    return /["'](?<path>@?core-js(?:\/pure)?\/[^"']+)["']/u.exec(trimmed)?.groups.path.replace('@core-js/pure', 'core-js');
  });
  return JSON.stringify(found.filter(Boolean).sort());
}

function label(directory) {
  return path.relative(fixturesDir, directory);
}

// counted silently - with 8k+ fixtures the per-pass line drowns the failures
function pass() {
  counts.passed++;
}

function fail(directory, ...lines) {
  counts.failed++;
  echo(red(`${ cyan(label(directory)) } failed${ lines.length ? ':' : '' }`));
  for (const line of lines) echo`  ${ line }`;
}

function firstDiff(actual, expected) {
  const al = actual.split('\n');
  const el = expected.split('\n');
  for (let i = 0; i < Math.max(al.length, el.length); i++) {
    if (al[i] !== el[i]) {
      return `${ yellow(`line ${ i + 1 }:`) }\n    expected: ${ el[i] ?? '(missing)' }\n    actual:   ${ al[i] ?? '(missing)' }`;
    }
  }
  return '';
}

// max lines to probe in mappings before giving up. 200 covers typed-array bundles (30+
// import prefix, user code after) with margin; bigger inputs would slow the test loop
const MAPPING_PROBE_LIMIT = 200;

// reject helper factory: keeps reject closure local without re-allocating per check
function rejectMap(directory, msg) {
  counts.failed++;
  echo(red(`${ cyan(label(directory)) } map invalid: ${ msg }`));
  return false;
}

// shape: fields exist with correct types. wrong-typed fields would fail later checks
// silently (e.g. iteration over non-array `sources`); fail loud here instead
function checkMapShape(directory, map) {
  function reject(msg) {
    return rejectMap(directory, msg);
  }
  if (map.version !== 3) return reject(`version=${ map.version } (expected 3)`);
  if (!Array.isArray(map.sources)) return reject('sources is not an array');
  if (typeof map.mappings !== 'string') return reject('mappings is not a string');
  if (map.sourcesContent !== undefined && !Array.isArray(map.sourcesContent)) {
    return reject('sourcesContent is not an array');
  }
  if (map.names !== undefined && !Array.isArray(map.names)) return reject('names is not an array');
  return true;
}

// content: `sources[0]` must equal the test id verbatim. MagicString's `getRelativePath`
// collapses to basename when source/file are the same path - this check guards the shape
// downstream bundlers actually consume. `sourcesContent[0]` (if present) must match input
// verbatim - mismatch means MagicString lost source bytes during transform composition
function checkMapContent(directory, map, testId, source) {
  function reject(msg) {
    return rejectMap(directory, msg);
  }
  if (map.sources.length && map.sources[0] !== testId) {
    return reject(`sources[0]=${ JSON.stringify(map.sources[0]) }, expected ${ JSON.stringify(testId) }`);
  }
  if (map.sourcesContent?.length && map.sourcesContent[0] !== undefined && map.sourcesContent[0] !== null
      && map.sourcesContent[0] !== source) {
    return reject(`sourcesContent[0] doesn't match input source (${ map.sourcesContent[0].length }b vs ${ source.length }b)`);
  }
  return true;
}

// VLQ decode + round-trip probe combined: TraceMap construction parses lazily, so
// `originalPositionFor(line=1, col=0)` forces VLQ decode AND yields the first probe
// result. surfaces malformed VLQ / all-zero mappings that TraceMap silently accepts
// but devtools can't navigate from. probes every line up to MAPPING_PROBE_LIMIT
function checkMapMappings(directory, map, method) {
  if (!map.mappings || !map.sources.length) return true;
  function reject(msg) {
    return rejectMap(directory, msg);
  }
  let tm;
  try {
    tm = new TraceMap(map);
  } catch (error) {
    return reject(`VLQ decode failed: ${ error.message }`);
  }
  // an entry-global fixture is usually the entry import ALONE (plus comments): the rewrite
  // replaces that import wholesale, so the output holds only synthetic statements and there
  // is legitimately nothing user-mapped to find - a mixed file WOULD map its surviving
  // code, but the runner cannot cheaply tell the shapes apart. VLQ decode above still ran
  if (method === 'entry-global') return true;
  const lines = (map.mappings.match(/;/g) ?? []).length + 1;
  // both ENDS of the output: a file may lead with hundreds of synthetic import lines (no
  // mapping by design), leaving the reprinted user code - the mapping the probe is after -
  // beyond a head-only window
  const probed = new Set();
  for (let i = 0; i < Math.min(lines, MAPPING_PROBE_LIMIT); i++) {
    probed.add(1 + i);
    probed.add(lines - i);
  }
  for (const line of probed) {
    // the first segment AT OR AFTER the line start: the AST reprint's first mapped token may
    // sit past column 0 (a leading paren carries no mapping of its own), which the default
    // at-or-before bias reads as unmapped; an all-zero or malformed map still yields nothing
    const probe = originalPositionFor(tm, { line, column: 0, bias: LEAST_UPPER_BOUND });
    if (probe.source !== undefined && probe.source !== null
        && probe.line !== undefined && probe.line !== null) return true;
  }
  return reject(`no user-code mapping resolves to a valid source position (${ lines } lines, ${ MAPPING_PROBE_LIMIT }-line window at each end)`);
}

// sourcemap check: shape + content + VLQ-decode + round-trip probe. empty `mappings` is
// permitted - entry-global with exclude-all emits no transforms and the resulting blank
// map is a legitimate pass-through. null map (no transform) trivially passes
function checkSourceMapContent(directory, map, testId, source, method) {
  if (!map) return true;
  if (!checkMapShape(directory, map)) return false;
  if (!checkMapContent(directory, map, testId, source)) return false;
  if (!checkMapMappings(directory, map, method)) return false;
  return true;
}

// parse-validate the transformed output - unparsable codegen (missing semi, broken ASI
// that accidentally creates syntax errors, malformed emit) is caught here even when
// loose-mode `compareLoose` only checks imports
function checkOutputParses(directory, code, testId) {
  // share the SFC lang-suffix lift with the plugin (Vue/Svelte/Astro virtual ids carry the
  // parser-language hint in the query); without it the validator rejects TS / JSX syntax
  // on the `.vue` / `.svelte` extension default
  const parseId = liftSfcLangSuffix(testId);
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const parsed = parseSync(parseId, code, { sourceType: 'module' });
  const errors = parsed.errors?.filter(err => err.severity === 'Error');
  if (!errors?.length) return true;
  counts.failed++;
  echo(red(`${ cyan(label(directory)) } output has parse errors:`));
  for (const err of errors.slice(0, 3)) echo(`  ${ err.message?.split('\n', 1)[0] ?? err }`);
  return false;
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

function captureTransform(source, pluginOptions, testId) {
  // plugin instantiation is INSIDE the hijack window because constructor-time warns
  // (e.g. `unknown bundler` from plugin.js:106) fire there — moving `createPlugin` out
  // would leak that diagnostic past the runner before `restore()` runs
  const { logs, warns, restore } = captureConsole();
  try {
    const plugin = createPlugin(pluginOptions);
    let result = plugin.transform(source, testId);
    // TS type assertions like <Type>expr cause JSX parse errors — retry without JSX
    // only when source actually contains `<` that could be misinterpreted
    if (result === null && testId.endsWith('.tsx') && source.includes('<') && !source.includes('/>')) {
      result = plugin.transform(source, testId.replace('.tsx', '.ts'));
    }
    return { code: result?.code ?? source, map: result?.map ?? null, abstained: result === null, logs, warns };
  } finally {
    restore();
  }
}

async function runErrorFixture(directory, pluginOptions, errorFile) {
  // use the fixture's real input so runtime-triggered errors (e.g. `shouldInjectPolyfill`
  // throwing during usage resolution) can reach `transform` - a dummy `'x;'` misses them
  const inputPath = join(directory, 'input.mjs');
  const source = await pathExists(inputPath) ? await readFile(inputPath, UTF8) : 'x;';
  // a babel@8-only error: unplugin's oxc parser accepts the input babel rejects (e.g. legacy
  // TS `module N {}`), so an `output-unplugin.mjs` sidecar records what unplugin emits instead
  // of erroring. present sidecar => expect a successful transform matching it
  const unpluginOutputFile = join(directory, 'output-unplugin.mjs');
  if (OVERWRITE) {
    // record the sidecar when unplugin transforms what babel rejects; drop it when unplugin also
    // errors (the shared error.txt then covers both)
    let sidecar = null;
    try {
      sidecar = normalize(captureTransform(source, pluginOptions, 'input.ts').code);
    } catch { /* fall through to the drop */ }
    await writeIfChanged(directory, unpluginOutputFile, sidecar);
    return;
  }
  if (await pathExists(unpluginOutputFile)) {
    const { code } = captureTransform(source, pluginOptions, 'input.ts');
    return compareStrict(directory, normalize(code), unpluginOutputFile);
  }
  const expected = (await readFile(errorFile, UTF8)).trim()
    // babel wraps `error.message` with a `<filename>: ` prefix (or `unknown file: ` when
    // options omit the filename); earlier `[BABEL] ` is the CLI-level prefix. strip both
    // layers so comparison matches unplugin's raw error
    .replace(/^\[BABEL\] /, '')
    .replace(/^[^\n:]+: /, '')
    .replace(/\n? ?\(While processing:.*\)$/s, '')
    .trim();
  try {
    createPlugin(pluginOptions).transform(source, 'input.ts');
    fail(directory, 'expected error but none thrown');
  } catch (error) {
    // unplugin's shared `tagError` decorates uncaught errors with `[core-js] [input.ts] `
    // prefix; babel-plugin test runner doesn't set `filename` so the same helper returns
    // early (no file tag). strip the unplugin file marker before comparison so a single
    // canonical `error.txt` (regenerated by babel-plugin runner) works for both
    const actual = error.message.trim().replace(/^\[core-js\] \[input\.ts\] /, '');
    if (actual === expected) pass();
    else fail(directory, `expected: ${ expected }`, `actual:   ${ actual }`);
  }
}

// table-driven validation for side-channel files (`debug.txt`, `warnings.txt`). symmetric
// with babel-plugin runner's unified `expected[]` loop. each tuple `[file, content]`:
//   content === null → file must NOT exist (any presence is `unexpected ${ file }`)
//   content !== null → file must exist AND match exactly
// OVERWRITE auto-creates files when content is non-null and removes them otherwise. `null`
// is the runner's signal for "no observable output on this channel" — strict in both
// directions catches drift from either side
// `<stem>.<ext>` -> `<stem>-unplugin.<ext>`: the side-channel counterpart of `output-unplugin.mjs`
function unpluginVariantPath(file) {
  const dot = file.lastIndexOf('.');
  return `${ file.slice(0, dot) }-unplugin${ file.slice(dot) }`;
}

async function checkSideChannels(directory, channels) {
  // each channel is `[file, content, normalizeExpected]`; the third element (default identity) is
  // applied to the EXPECTED baseline read so it gets the same normalization the actual `content`
  // already went through - the debug slot passes `collapseDriftingTargets`, keeping both comparison
  // sides aligned (mirrors the babel runner's third-element contract; without it a collapsed actual
  // was compared against an un-collapsed baseline - dormant only because baselines store pre-collapsed)
  for (const [file, content, normalizeExpected = x => x] of channels) {
    if (OVERWRITE) {
      // the base channel file (debug.txt / warnings.txt) is babel-owned, regenerated by the babel
      // runner - never clobber it. record unplugin's divergence in a `<stem>-unplugin.<ext>` variant
      // (assumes babel's base is already current; run the babel OVERWRITE first), drop it on agreement
      const variant = unpluginVariantPath(file);
      const baseContent = await pathExists(file) ? normalizeExpected(normalize(await readFile(file, UTF8))) : null;
      const desired = content !== null && baseContent !== null && content !== baseContent ? content : null;
      await writeIfChanged(directory, variant, desired);
      continue;
    }
    // prefer a `<stem>-unplugin.<ext>` sidecar when unplugin's channel output legitimately
    // diverges from babel's baseline (e.g. babel@8 no-targets => ["defaults"] "added no polyfill"
    // vs unplugin's polyfill-all debug) - mirrors the `output-unplugin.mjs` divergence contract
    const variant = unpluginVariantPath(file);
    const expectedFile = await pathExists(variant) ? variant : file;
    const fileExists = await pathExists(expectedFile);
    if (content === null) {
      if (!fileExists) continue;
      fail(directory, `unexpected ${ basename(expectedFile) } (commit empty or remove)`);
      return false;
    }
    if (!fileExists) {
      fail(directory, `${ basename(expectedFile) } missing: ${ content.split('\n').at(-1) }`);
      return false;
    }
    const expected = normalizeExpected(normalize(await readFile(expectedFile, UTF8)));
    if (content === expected) continue;
    fail(directory, `${ basename(expectedFile) } mismatch: ${ content.split('\n').at(-1) || '(empty)' }`);
    return false;
  }
  return true;
}

// shared pass/fail+firstDiff pattern. all three compare-helpers below normalize their
// inputs differently (raw / extractImports / stripBoilerplate) and then delegate the
// equality decision here
function compareNormalized(directory, actual, expected) {
  if (actual === expected) pass();
  else fail(directory, firstDiff(actual, expected));
}

// full-text comparator (used when `output-unplugin.mjs` is present in any mode, or as
// the default for usage-pure). babel and unplugin differ in codegen minutiae - both
// sides go through `normalize` + `collapseWhitespace` so whitespace-only divergence
// doesn't fail
async function compareStrict(directory, actual, directFile) {
  compareNormalized(directory, actual, normalize(await readFile(directFile, UTF8)));
}

// the structural comparator: the unplugin leg is an AST renderer like babel, so the output
// must be STRUCTURALLY identical to the babel baseline (`tests/unplugin/structural.mjs`
// owns what counts as formatting) - a difference is a defect, never formatting. three lanes
// degrade to an imports-only compare, each with a reason the body compare cannot own: an
// ABSTAIN (`null`) keeps the user's bytes while babel may reprint normalization-only
// changes; a baseline that DOES NOT PARSE has a babel-generator defect baked in; and a
// fixture whose babel chain carries OTHER real plugins bakes their work into the baseline
// body. an `output-unplugin.mjs` sidecar records an ACCEPTED unplugin-vs-babel divergence
// (environment-dependent targets resolution, the `require` dialect on SFC virtuals) and is
// byte-held via `compareStrict`; OVERWRITE regenerates the sidecar set from scratch: one is
// written exactly where the structural (or lane's import-set) compare against babel differs
async function compareMainOutput({ directory, actual, babelOutput, babelOptions, parseId, abstained, hasUnpluginOutput, unpluginOutputFile }) {
  const looseLane = abstained || BASELINE_GENERATOR_DEFECTS.has(basename(directory))
    || (babelOptions.plugins ?? []).some(plugin => !(Array.isArray(plugin) && plugin[0] === '@core-js'));
  let agrees;
  if (looseLane) {
    agrees = importsOf(actual) === importsOf(babelOutput);
  } else {
    const baselineParsed = parseOrNull(parseId, babelOutput);
    if (!baselineParsed) {
      // unparsable baseline: the generator-defect lane without a listed name
      agrees = importsOf(actual) === importsOf(babelOutput);
    } else {
      const actualParsed = parseOrNull(parseId, actual);
      if (!actualParsed) return fail(directory, 'output does not parse for the structural compare');
      agrees = JSON.stringify(strip(actualParsed.program)) === JSON.stringify(strip(baselineParsed.program));
    }
  }
  if (OVERWRITE) {
    await writeIfChanged(directory, unpluginOutputFile, agrees ? null : actual);
    return;
  }
  if (agrees) return pass();
  if (hasUnpluginOutput) return compareStrict(directory, actual, unpluginOutputFile);
  fail(directory, 'differs from the babel baseline (structurally, or by import set on a loose lane)',
    firstDiff(actual, babelOutput));
}

async function runFixture(directory) {
  const unpluginOutputFile = join(directory, 'output-unplugin.mjs');
  const hasUnpluginOutput = await pathExists(unpluginOutputFile);
  const babelOptions = await loadBabelOptions(directory);

  if (shouldSkip(path.basename(directory), babelOptions)) {
    if (hasUnpluginOutput) return fail(directory, `stale ${ cyan('output-unplugin.mjs') } in skipped fixture`);
    counts.skipped++;
    return;
  }

  if (!babelOptions) {
    counts.skipped++;
    return;
  }

  const pluginOptions = extractPluginOptions(babelOptions);
  if (!pluginOptions) {
    counts.skipped++;
    return;
  }

  const errorFile = join(directory, 'error.txt');
  if (await pathExists(errorFile)) return runErrorFixture(directory, pluginOptions, errorFile);

  const outputFile = join(directory, 'output.mjs');
  if (!await pathExists(outputFile)) {
    counts.skipped++;
    return;
  }

  try {
    const testId = inferTestId(babelOptions);
    const source = await readFile(join(directory, 'input.mjs'), UTF8);
    const { code, map, abstained, logs, warns } = captureTransform(source, pluginOptions, testId);
    const actual = normalize(code);
    const babelOutput = normalize(await readFile(outputFile, UTF8));

    const debugContent = collapseDriftingTargets(logs.length ? normalize(logs.join('\n')) : null);
    const warningsContent = warns.length ? normalize(warns.join('\n')) : null;
    if (!await checkSideChannels(directory, [
      [join(directory, 'debug.txt'), debugContent, collapseDriftingTargets],
      [join(directory, 'warnings.txt'), warningsContent],
    ])) return;
    if (!checkSourceMapContent(directory, map, testId, source, pluginOptions.method)) return;
    if (!checkOutputParses(directory, code, testId)) return;
    await compareMainOutput({
      directory, actual, babelOutput, babelOptions, parseId: liftSfcLangSuffix(testId), abstained,
      hasUnpluginOutput, unpluginOutputFile,
    });
  } catch (error) {
    fail(directory, error.message);
  }
}

// a shard child receives the subtree filter via env (the zx CLI keeps the script name in
// argv._, so a positional arg would land off-by-one against the zxi-invoked parent)
const subtree = FIXTURE_SHARD ? process.env.FIXTURE_SUBTREE : args[0];
const fixtures = [];
for (const mode of ['entry-global', 'usage-global', 'usage-pure']) {
  if (subtree && subtree !== mode && !subtree.startsWith(`${ mode }/`)) continue;
  const only = subtree?.startsWith(`${ mode }/`) ? subtree.slice(mode.length + 1) : null;
  for (const name of (await readdir(join(fixturesDir, mode))).sort()) {
    if (only && name !== only) continue;
    const dir = join(fixturesDir, mode, name);
    if ((await stat(dir)).isDirectory()) fixtures.push(dir);
  }
}

// a child reports through the marker only; the parent aggregates and decides the exit
if (FIXTURE_SHARD) {
  for (const dir of shardSlice(fixtures)) await runFixture(dir);
  emitShardSummary(counts);
} else {
  const shards = defaultShardCount(fixtures.length);
  echo(green(`unplugin fixtures (structural against the babel baseline): ${ cyan(fixtures.length) } in ${ cyan(shards) } shard(s); only failures and rewrites are printed below`));
  if (shards > 1) {
    Object.assign(counts, await runShards({
      script: fileURLToPath(import.meta.url), shards, extraEnv: subtree ? { FIXTURE_SUBTREE: subtree } : {},
    }));
  } else {
    for (const dir of fixtures) await runFixture(dir);
  }
  const { passed, failed, skipped } = counts;
  echo(`\nPassed: ${ green(passed) }, Failed: ${ failed ? red(failed) : green(failed) }, Skipped: ${ yellow(skipped) }`);
  // corpus-presence canary - a walk or filter regression must not read green; a subtree run
  // is a deliberate narrowing, so only the full corpus is held to it
  if (!subtree && !OVERWRITE && passed + failed < 200) throw new Error(`unplugin corpus collapsed: only ${ passed + failed } fixtures compared`);
  if (failed) throw new Error('Some tests have failed');
}
