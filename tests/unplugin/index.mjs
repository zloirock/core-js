import { parseSync } from 'oxc-parser';
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { liftSfcLangSuffix } from '../../packages/core-js-unplugin/internals/plugin-helpers.js';

const { readdir, readFile, readJson, rm, stat, writeFile } = fs;
const { basename, join } = path;
const { cyan, green, red, yellow } = chalk;

const { OVERWRITE } = process.env;
const UTF8 = { encoding: 'utf8' };
const ROOT = path.resolve('../..').replaceAll('\\', '/');
const fixturesDir = path.resolve('../transpiler-fixtures');

// eslint-disable-next-line promise/prefer-await-to-then -- ok
const exists = file => fs.access(file).then(() => true, () => false);

const counts = { passed: 0, failed: 0, skipped: 0 };

function normalize(code) {
  return code.replaceAll('\\\\', '/').replaceAll(ROOT, '<CWD>').trim();
}

// collapse the debug `Using targets: { ... }` block to a placeholder - mirrors the babel-plugin
// runner's `normalizeDriftingTargets`. the babel runner applies it to the shared debug.txt baseline
// (babel@8 no-targets resolves to a drifting `["defaults"]` set), so the unplugin debug must collapse
// the same line or every targets-bearing debug fixture would spuriously diverge from the baseline
function collapseDriftingTargets(text) {
  return text === null ? text : text.replace(/Using targets: \{[^}]*\}/, 'Using targets: <RESOLVED>');
}

// collapse cosmetic whitespace outside string literals for formatting-insensitive comparison.
// spaces between identifier-like tokens (keywords, names) are preserved to catch
// broken codegen like `constfrom` instead of `const from`. line/block comments are
// consumed whole (dropped from output) so apostrophes inside comments don't get mistaken
// for string delimiters and swallow the rest of the file
function collapseWhitespace(code) {
  let result = '';
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if (ch === '/' && code[i + 1] === '/') {
      // ECMA-262 LineTerminator: LF / CR / U+2028 / U+2029
      while (i < code.length && code[i] !== '\n' && code[i] !== '\r'
        && code[i] !== '\u2028' && code[i] !== '\u2029') i++;
      continue;
    }
    if (ch === '/' && code[i + 1] === '*') {
      i += 2;
      while (i + 1 < code.length && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i++; // land on final `/` — outer i++ advances past
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      result += ch;
      for (i++; i < code.length; i++) {
        result += code[i];
        if (code[i] === '\\') {
          result += code[++i] ?? '';
          continue;
        }
        if (code[i] === quote) break;
      }
    } else if (/\s/.test(ch)) {
      // keep a single space only when both neighbors are word characters
      const before = result.at(-1);
      // scan ahead to the next non-whitespace
      let j = i + 1;
      while (j < code.length && /\s/.test(code[j])) j++;
      const after = code[j];
      if (before && after && /[\w$]/.test(before) && /[\w$]/.test(after)) result += ' ';
      i = j - 1;
    } else {
      result += ch;
    }
  }
  return result.trim();
}

// strip Babel-specific boilerplate + collapse whitespace for cross-plugin comparison
function stripBoilerplate(code) {
  return collapseWhitespace(code.split('\n')
    .filter(l => !/^\s*["']use strict["']/.test(l))
    .join('\n'));
}

// the injected-polyfill set, for the imports-only loose comparison. captures BOTH ESM
// (`import "core-js/..."` / `import _x from "core-js/..."`) and CJS (`require("core-js/...")`)
// forms - global-mode CJS / importStyle:require fixtures emit polyfills as side-effect
// `require(...)`, which an `import `-only filter skips, making the loose compare vacuously
// pass against any require-set regression (no requires, wrong set, or `import` for `require`).
// `trimStart` guards against future codegen drift that could indent the injected lines
function extractImports(code) {
  return code.split('\n').filter(l => {
    const trimmed = l.trimStart();
    return trimmed.startsWith('import ') || /^require\(["']core-js\//.test(trimmed);
  }).sort().join('\n');
}

function label(directory) {
  return path.relative(fixturesDir, directory);
}

function pass(directory) {
  counts.passed++;
  echo`${ cyan(label(directory)) } ${ green('passed') }`;
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

function extractPluginOptions(babelOptions) {
  for (const plugin of babelOptions.plugins ?? []) {
    if (Array.isArray(plugin) && plugin[0] === '@core-js') {
      const opts = { ...plugin[1] };
      if (!opts.targets && babelOptions.targets) opts.targets = babelOptions.targets;
      if (babelOptions.caller?.name === 'babel-loader') opts.bundler = 'webpack';
      return opts;
    }
  }
  return null;
}

async function loadBabelOptions(directory) {
  for (const file of ['options.json', 'options.mjs']) {
    const full = join(directory, file);
    if (!await exists(full)) continue;
    if (file.endsWith('.json')) return readJson(full, UTF8);
    const { pathToFileURL } = await import('node:url');
    return (await import(pathToFileURL(path.resolve(full)).href)).default;
  }
  return null;
}

// oxc-parser auto-enables JSX/TS based on file extension. `.ts` covers the typescript
// plugin (default fallback), `.jsx` for JSX-only without TS, `.tsx` when both. matrix
// of the 4 filds: (jsx, ts) → '.tsx'; (jsx, !ts) → '.jsx'; (!jsx, ts) → '.ts';
// (!jsx, !ts) → '.ts' (default — typescript-friendly is the safe default)
function inferTestId(babelOptions) {
  if (babelOptions.filename) return babelOptions.filename;
  const parserPlugins = babelOptions.parserOpts?.plugins ?? [];
  const hasJsx = parserPlugins.includes('jsx');
  const hasTs = parserPlugins.includes('typescript');
  if (hasJsx) return hasTs ? 'input.tsx' : 'input.jsx';
  return 'input.ts';
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
  const reject = msg => rejectMap(directory, msg);
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
  const reject = msg => rejectMap(directory, msg);
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
  const reject = msg => rejectMap(directory, msg);
  let tm;
  try {
    tm = new TraceMap(map);
  } catch (error) {
    return reject(`VLQ decode failed: ${ error.message }`);
  }
  // entry-global emits all-synthetic imports (no user-code mapping survives the rewrite
  // by design); skip the round-trip probe but VLQ decode above still ran
  if (method === 'entry-global') return true;
  const lines = (map.mappings.match(/;/g) ?? []).length + 1;
  const limit = Math.min(lines, MAPPING_PROBE_LIMIT);
  for (let line = 1; line <= limit; line++) {
    const probe = originalPositionFor(tm, { line, column: 0 });
    if (probe.source !== undefined && probe.source !== null
        && probe.line !== undefined && probe.line !== null) return true;
  }
  return reject(`no user-code mapping resolves to a valid source position (lines 1..${ limit })`);
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
    return { code: result?.code ?? source, map: result?.map ?? null, logs, warns };
  } finally {
    restore();
  }
}

const SKIP_DIRS = new Set([
  'source-script',
  'cjs-transform-export',
  // babel-only: regression depends on `transform-destructuring` rewriting the param's
  // ObjectPattern to `_ref` Identifier between core-js's pre-traversal and programExit
  // emission. unplugin extracts only `@core-js` from `babelOptions.plugins` and runs it
  // standalone, so the AST shape that triggered the bug never appears here
  'audit-synth-swap-survives-transform-destructuring',
  // babel-only: late-CJS detection diagnostic depends on a sibling babel plugin
  // (`@babel/plugin-transform-modules-commonjs`) running after our programExit. unplugin
  // doesn't have a babel plugin chain - it parses with oxc and runs core-js standalone,
  // so the markersGone trigger never fires here. SKIP_DIRS matches by basename so the
  // single entry covers both usage-pure and usage-global copies of the fixture
  'audit-late-cjs-rewriter-warning',
  // babel-only: depends on `transform-object-rest-spread` inlining `Object.assign` for the spread
  // under setSpreadProperties, which our post-pass then polyfills. unplugin runs core-js standalone
  // (no babel plugin chain), so the spread is never lowered to an Object.assign here
  'audit-object-spread-introduced-assign-polyfills',
]);

// flow language fixtures: oxc-parser doesn't support Flow syntax, so unplugin can't run
// them. detection routes through the explicit `flow` parser plugin in options.json -
// earlier name-based heuristic (`dirName.includes('-flow-')`) over-skipped unrelated
// audit fixtures whose names merely mention `flow` (e.g. `*-control-flow-bail`,
// `*-flow-multi-hop`, `*-flow-segments`), all of which actually parse as TS or vanilla JS
function shouldSkip(dirName, babelOptions) {
  if (SKIP_DIRS.has(dirName)) return true;
  const plugins = babelOptions?.parserOpts?.plugins ?? [];
  return plugins.some(p => (typeof p === 'string' ? p : p?.[0]) === 'flow');
}

async function runErrorFixture(directory, pluginOptions, errorFile) {
  // use the fixture's real input so runtime-triggered errors (e.g. `shouldInjectPolyfill`
  // throwing during usage resolution) can reach `transform` - a dummy `'x;'` misses them
  const inputPath = join(directory, 'input.mjs');
  const source = await exists(inputPath) ? await readFile(inputPath, UTF8) : 'x;';
  // a babel@8-only error: unplugin's oxc parser accepts the input babel rejects (e.g. legacy
  // TS `module N {}`), so an `output-unplugin.mjs` sidecar records what unplugin emits instead
  // of erroring. present sidecar => expect a successful transform matching it
  const unpluginOutputFile = join(directory, 'output-unplugin.mjs');
  if (OVERWRITE) {
    // record the sidecar when unplugin transforms what babel rejects; drop it when unplugin also
    // errors (the shared error.txt then covers both)
    try {
      const { code } = captureTransform(source, pluginOptions, 'input.ts');
      await writeFile(unpluginOutputFile, normalize(code), UTF8);
    } catch { await rm(unpluginOutputFile, { force: true }); }
    return echo`${ cyan(label(directory)) } ${ yellow('written') }`;
  }
  if (await exists(unpluginOutputFile)) {
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
    if (actual === expected) pass(directory);
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
  for (const [file, content] of channels) {
    if (OVERWRITE) {
      // the base channel file (debug.txt / warnings.txt) is babel-owned, regenerated by the babel
      // runner - never clobber it. record unplugin's divergence in a `<stem>-unplugin.<ext>` variant
      // (assumes babel's base is already current; run the babel OVERWRITE first), drop it on agreement
      const variant = unpluginVariantPath(file);
      const baseContent = await exists(file) ? normalize(await readFile(file, UTF8)) : null;
      if (content !== null && baseContent !== null && content !== baseContent) await writeFile(variant, content, UTF8);
      else await rm(variant, { force: true });
      continue;
    }
    // prefer a `<stem>-unplugin.<ext>` sidecar when unplugin's channel output legitimately
    // diverges from babel's baseline (e.g. babel@8 no-targets => ["defaults"] "added no polyfill"
    // vs unplugin's polyfill-all debug) - mirrors the `output-unplugin.mjs` divergence contract
    const variant = unpluginVariantPath(file);
    const expectedFile = await exists(variant) ? variant : file;
    const fileExists = await exists(expectedFile);
    if (content === null) {
      if (!fileExists) continue;
      fail(directory, `unexpected ${ basename(expectedFile) } (commit empty or remove)`);
      return false;
    }
    if (!fileExists) {
      fail(directory, `${ basename(expectedFile) } missing: ${ content.split('\n').at(-1) }`);
      return false;
    }
    const expected = normalize(await readFile(expectedFile, UTF8));
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
  if (actual === expected) pass(directory);
  else fail(directory, firstDiff(actual, expected));
}

// full-text comparator (used when `output-unplugin.mjs` is present in any mode, or as
// the default for usage-pure). babel and unplugin differ in codegen minutiae - both
// sides go through `normalize` + `collapseWhitespace` so whitespace-only divergence
// doesn't fail
async function compareStrict(directory, actual, directFile) {
  compareNormalized(directory, actual, normalize(await readFile(directFile, UTF8)));
}

// imports-only comparator: default for entry-global / usage-global. body divergence
// between babel AST codegen and unplugin text-transform is tolerated by default; opt into
// strict tail comparison by dropping an `output-unplugin.mjs` next to `output.mjs`
function compareLoose(directory, actual, babelOutput) {
  compareNormalized(directory, extractImports(actual), extractImports(babelOutput));
}

// full-text compare under `stripBoilerplate` (collapses whitespace, drops the `'use strict'` prologue).
// the sidecar opt-in is the divergence itself: OVERWRITE writes `output-unplugin.mjs` whenever unplugin's
// text differs from babel's and removes it when they agree, so EVERY needed sidecar regenerates from
// scratch on the OVERWRITE flag (no hand-maintained list of which fixtures to pin)
async function compareFullText(directory, actual, babelOutput, hasUnpluginOutput, unpluginOutputFile) {
  if (OVERWRITE) {
    if (stripBoilerplate(actual) === stripBoilerplate(babelOutput)) await rm(unpluginOutputFile, { force: true });
    else await writeFile(unpluginOutputFile, actual, UTF8);
    return echo`${ cyan(label(directory)) } ${ yellow('written') }`;
  }
  if (hasUnpluginOutput) return compareStrict(directory, actual, unpluginOutputFile);
  compareNormalized(directory, stripBoilerplate(actual), stripBoilerplate(babelOutput));
}

// pick the comparator by plugin method. usage-pure AND entry-global go through the full-text compare:
// entry removal can mutate the body (ASI guard `;`, `0;` directive-promotion placeholder, spurious-semi
// suppression) - a token-level transform an imports-only check and `checkOutputParses` (rejects only
// UNPARSABLE output) are both blind to. the full-text path pins the body and regenerates the sidecar on
// OVERWRITE; usage-global is import-injection-only (body is reprint-only) so it stays imports-only loose,
// recording a sidecar only when the import set diverges (babel@8 no-targets skips a polyfill unplugin injects)
async function compareMainOutput({ directory, actual, babelOutput, method, hasUnpluginOutput, unpluginOutputFile }) {
  if (method === 'usage-pure' || method === 'entry-global') {
    return compareFullText(directory, actual, babelOutput, hasUnpluginOutput, unpluginOutputFile);
  }
  if (OVERWRITE) {
    const importsDiverge = extractImports(actual) !== extractImports(babelOutput);
    if (hasUnpluginOutput || importsDiverge) await writeFile(unpluginOutputFile, actual, UTF8);
    else await rm(unpluginOutputFile, { force: true });
    return echo`${ cyan(label(directory)) } ${ yellow('written') }`;
  }
  if (hasUnpluginOutput) return compareStrict(directory, actual, unpluginOutputFile);
  compareLoose(directory, actual, babelOutput);
}

async function runFixture(directory) {
  const unpluginOutputFile = join(directory, 'output-unplugin.mjs');
  const hasUnpluginOutput = await exists(unpluginOutputFile);
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
  if (await exists(errorFile)) return runErrorFixture(directory, pluginOptions, errorFile);

  const outputFile = join(directory, 'output.mjs');
  if (!await exists(outputFile)) {
    counts.skipped++;
    return;
  }

  try {
    const testId = inferTestId(babelOptions);
    const source = await readFile(join(directory, 'input.mjs'), UTF8);
    const { code, map, logs, warns } = captureTransform(source, pluginOptions, testId);
    const actual = normalize(code);
    const babelOutput = normalize(await readFile(outputFile, UTF8));

    const debugContent = collapseDriftingTargets(logs.length ? normalize(logs.join('\n')) : null);
    const warningsContent = warns.length ? normalize(warns.join('\n')) : null;
    if (!await checkSideChannels(directory, [
      [join(directory, 'debug.txt'), debugContent],
      [join(directory, 'warnings.txt'), warningsContent],
    ])) return;
    if (!checkSourceMapContent(directory, map, testId, source, pluginOptions.method)) return;
    if (!checkOutputParses(directory, code, testId)) return;
    await compareMainOutput({
      directory, actual, babelOutput, method: pluginOptions.method, hasUnpluginOutput, unpluginOutputFile,
    });
  } catch (error) {
    fail(directory, error.message);
  }
}

for (const mode of ['entry-global', 'usage-global', 'usage-pure']) {
  for (const name of (await readdir(join(fixturesDir, mode))).sort()) {
    const dir = join(fixturesDir, mode, name);
    if ((await stat(dir)).isDirectory()) await runFixture(dir);
  }
}

const { passed, failed, skipped } = counts;
echo(`\nPassed: ${ green(passed) }, Failed: ${ failed ? red(failed) : green(failed) }, Skipped: ${ yellow(skipped) }`);
if (failed) throw new Error('Some tests have failed');
