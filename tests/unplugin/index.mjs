import { parseSync } from 'oxc-parser';
import { TraceMap } from '@jridgewell/trace-mapping';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';

const { readdir, readFile, readJson, rm, stat, writeFile } = fs;
const { join } = path;
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
      const before = result[result.length - 1];
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

function extractImports(code) {
  return code.split('\n').filter(l => l.startsWith('import ')).sort().join('\n');
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
  for (const plugin of babelOptions.plugins || []) {
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

// oxc-parser auto-enables JSX based on file extension
function inferTestId(babelOptions) {
  if (babelOptions.filename) return babelOptions.filename;
  const parserPlugins = babelOptions.parserOpts?.plugins || [];
  if (parserPlugins.includes('jsx')) return 'input.tsx';
  return 'input.ts';
}

// sourcemap check: structural shape + VLQ decode. segments that round-trip to null
// sources are fine (entry-global emits all-synthetic output; user-code line mappings
// survive in usage-*). catches empty-mappings / malformed VLQ / missing sources
function checkSourceMapShape(directory, map) {
  if (!map) return true;
  const reject = msg => {
    counts.failed++;
    echo(red(`${ cyan(label(directory)) } map invalid: ${ msg }`));
    return false;
  };
  if (map.version !== 3) return reject(`version=${ map.version } (expected 3)`);
  if (!Array.isArray(map.sources)) return reject('sources is not an array');
  if (typeof map.mappings !== 'string') return reject('mappings is not a string');
  if (map.sourcesContent !== undefined && !Array.isArray(map.sourcesContent)) {
    return reject('sourcesContent is not an array');
  }
  try {
    new TraceMap(map);
  } catch (error) {
    return reject(`VLQ decode failed: ${ error.message }`);
  }
  return true;
}

// parse-validate the transformed output - unparsable codegen (missing semi, broken ASI
// that accidentally creates syntax errors, malformed emit) is caught here even when
// loose-mode `compareLoose` only checks imports
function checkOutputParses(directory, code, testId) {
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const parsed = parseSync(testId, code, { sourceType: 'module' });
  const errors = parsed.errors?.filter(err => err.severity === 'Error');
  if (!errors?.length) return true;
  counts.failed++;
  echo(red(`${ cyan(label(directory)) } output has parse errors:`));
  for (const err of errors.slice(0, 3)) echo(`  ${ err.message?.split('\n')[0] ?? err }`);
  return false;
}

function captureTransform(source, pluginOptions, testId) {
  const plugin = createPlugin(pluginOptions);
  const logs = [];
  const origLog = console.log;
  console.log = (...a) => logs.push(a.map(String).join(' '));
  try {
    let result = plugin.transform(source, testId);
    // TS type assertions like <Type>expr cause JSX parse errors — retry without JSX
    // only when source actually contains `<` that could be misinterpreted
    if (result === null && testId.endsWith('.tsx') && source.includes('<') && !source.includes('/>')) {
      result = plugin.transform(source, testId.replace('.tsx', '.ts'));
    }
    return { code: result?.code ?? source, map: result?.map ?? null, logs };
  } finally {
    console.log = origLog;
  }
}

const SKIP_DIRS = new Set([
  'source-script',
  'cjs-transform-export',
]);

function shouldSkip(dirName) {
  return SKIP_DIRS.has(dirName) || dirName.includes('-flow-') || dirName.startsWith('flow-');
}

async function runErrorFixture(directory, pluginOptions, errorFile) {
  const expected = (await readFile(errorFile, UTF8)).trim()
    // babel wraps `error.message` with a `<filename>: ` prefix (or `unknown file: ` when
    // options omit the filename); earlier `[BABEL] ` is the CLI-level prefix. strip both
    // layers so comparison matches unplugin's raw error
    .replace(/^\[BABEL\] /, '')
    .replace(/^[^\n:]+: /, '')
    .replace(/\n? ?\(While processing:.*\)$/s, '')
    .trim();
  // use the fixture's real input so runtime-triggered errors (e.g. `shouldInjectPolyfill`
  // throwing during usage resolution) can reach `transform` - a dummy `'x;'` misses them
  const inputPath = join(directory, 'input.mjs');
  const source = await exists(inputPath) ? await readFile(inputPath, UTF8) : 'x;';
  try {
    createPlugin(pluginOptions).transform(source, 'input.ts');
    fail(directory, 'expected error but none thrown');
  } catch (error) {
    if (error.message.trim() === expected) pass(directory);
    else fail(directory, `expected: ${ expected }`, `actual:   ${ error.message.trim() }`);
  }
}

async function checkDebugOutput(directory, logs) {
  const debugFile = join(directory, 'debug.txt');
  if (!await exists(debugFile)) return true;
  const expected = normalize(await readFile(debugFile, UTF8));
  const actual = logs.length ? normalize(logs.join('\n')) : '';
  if (actual === expected) return true;
  fail(directory, `debug mismatch: ${ actual.split('\n').at(-1) || '(empty)' }`);
  return false;
}

// full-text comparator (used when `output-unplugin.mjs` is present in any mode, or as
// the default for usage-pure). babel and unplugin differ in codegen minutiae - both
// sides go through `normalize` + `collapseWhitespace` so whitespace-only divergence
// doesn't fail
async function compareStrict(directory, actual, directFile) {
  const expected = normalize(await readFile(directFile, UTF8));
  if (actual === expected) pass(directory);
  else fail(directory, firstDiff(actual, expected));
}

// imports-only comparator: default for entry-global / usage-global. body divergence
// between babel AST codegen and unplugin text-transform is tolerated by default; opt into
// strict tail comparison by dropping an `output-unplugin.mjs` next to `output.mjs`
function compareLoose(directory, actual, babelOutput) {
  const actualImports = extractImports(actual);
  const expectedImports = extractImports(babelOutput);
  if (actualImports === expectedImports) pass(directory);
  else fail(directory, firstDiff(actualImports, expectedImports));
}

async function comparePureMode(directory, actual, babelOutput, hasUnpluginOutput, unpluginOutputFile) {
  if (OVERWRITE) {
    if (stripBoilerplate(actual) === stripBoilerplate(babelOutput)) await rm(unpluginOutputFile, { force: true });
    else await writeFile(unpluginOutputFile, actual, UTF8);
    return echo`${ cyan(label(directory)) } ${ yellow('written') }`;
  }
  if (hasUnpluginOutput) return compareStrict(directory, actual, unpluginOutputFile);
  const expected = stripBoilerplate(babelOutput);
  const comparable = stripBoilerplate(actual);
  if (comparable === expected) pass(directory);
  else fail(directory, firstDiff(comparable, expected));
}

async function runFixture(directory) {
  const unpluginOutputFile = join(directory, 'output-unplugin.mjs');
  const hasUnpluginOutput = await exists(unpluginOutputFile);

  if (shouldSkip(path.basename(directory))) {
    if (hasUnpluginOutput) return fail(directory, `stale ${ cyan('output-unplugin.mjs') } in skipped fixture`);
    counts.skipped++;
    return;
  }

  const babelOptions = await loadBabelOptions(directory);
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
    const { code, map, logs } = captureTransform(source, pluginOptions, testId);
    const actual = normalize(code);
    const babelOutput = normalize(await readFile(outputFile, UTF8));

    if (!await checkDebugOutput(directory, logs)) return;
    if (!checkSourceMapShape(directory, map)) return;
    if (!checkOutputParses(directory, code, testId)) return;

    // global modes with `output-unplugin.mjs` opt into strict tail validation; usage-pure
    // always goes through full-text compare (with its own OVERWRITE/auto-drop logic)
    if (pluginOptions.method === 'usage-pure') {
      await comparePureMode(directory, actual, babelOutput, hasUnpluginOutput, unpluginOutputFile);
    } else if (hasUnpluginOutput) {
      await compareStrict(directory, actual, unpluginOutputFile);
    } else {
      compareLoose(directory, actual, babelOutput);
    }
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
