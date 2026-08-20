// the AST engine's fixture gate: every fixture of a method the engine supports transforms
// with `engine: 'ast'` and the output must be STRUCTURALLY identical to the babel baseline
// `output.mjs` - both are AST renderers now, so a difference is a defect, never formatting
// (the text engine keeps its own byte-level runner and sidecars). methods join this gate as
// the migration lands them; a fixture of an unported method is counted, not compared
import { parseSync } from 'oxc-parser';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { liftSfcLangSuffix } from '../../packages/core-js-unplugin/internals/plugin-helpers.js';
import { extractPluginOptions, inferTestId, loadBabelOptions, normalizeMachinePaths, shouldSkip } from './fixture-lang.mjs';
import { strip } from './structural.mjs';

const { readdir, pathExists, readFile, stat } = fs;
const { join } = path;
const { cyan, green, red } = chalk;

const UTF8 = { encoding: 'utf8' };
const fixturesDir = path.resolve('../transpiler-fixtures');

const AST_METHODS = new Set(['entry-global']);

const counts = { compared: 0, skippedMethod: 0, skippedNoCase: 0, failed: 0 };
const failures = [];

function fail(directory, detail) {
  counts.failed++;
  if (failures.length < 15) failures.push(`${ directory }:\n${ detail }`);
}

function parseOrNull(testId, source) {
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const parsed = parseSync(testId, source, { sourceType: 'module' });
  return parsed.errors?.some(error => error.severity === 'Error') ? null : parsed;
}

async function runFixture(directory) {
  const babelOptions = await loadBabelOptions(directory);
  const pluginOptions = babelOptions && extractPluginOptions(babelOptions);
  if (!pluginOptions || shouldSkip(path.basename(directory), babelOptions)) {
    counts.skippedNoCase++;
    return;
  }
  if (!AST_METHODS.has(pluginOptions.method)) {
    counts.skippedMethod++;
    return;
  }
  // error fixtures lock option validation, not emission - the text runner owns them
  if (await pathExists(join(directory, 'error.txt')) || !await pathExists(join(directory, 'output.mjs'))) {
    counts.skippedNoCase++;
    return;
  }
  const label = path.relative(fixturesDir, directory);
  const testId = liftSfcLangSuffix(inferTestId(babelOptions));
  const source = await readFile(join(directory, 'input.mjs'), UTF8);
  // an `output-unplugin.mjs` sidecar overrides: it records an ACCEPTED unplugin-vs-babel
  // divergence (environment-dependent targets resolution and the like) that the engine
  // swap does not erase - the ast leg is held to the unplugin-semantics baseline
  const sidecarFile = join(directory, 'output-unplugin.mjs');
  const baseline = await pathExists(sidecarFile) ? await readFile(sidecarFile, UTF8) : await readFile(join(directory, 'output.mjs'), UTF8);
  counts.compared++;
  let astOut;
  try {
    astOut = normalizeMachinePaths(createPlugin({ ...pluginOptions, engine: 'ast' }).transform(source, testId)?.code ?? source);
  } catch (error) {
    return fail(label, `ast transform threw: ${ error.message }`);
  }
  const astParsed = parseOrNull(testId, astOut);
  if (!astParsed) return fail(label, `ast output does not parse:\n${ astOut }`);
  const baselineParsed = parseOrNull(testId, baseline);
  if (!baselineParsed) return fail(label, 'babel baseline does not parse (stale fixture?)');
  if (JSON.stringify(strip(astParsed.program)) !== JSON.stringify(strip(baselineParsed.program))) {
    return fail(label, `structurally different from the babel baseline\n--- ast:\n${ astOut.trim() }\n--- babel:\n${ baseline.trim() }`);
  }
}

async function walk(directory) {
  const entries = await readdir(directory);
  if (entries.includes('input.mjs')) return runFixture(directory);
  for (const entry of entries) {
    const full = join(directory, entry);
    if ((await stat(full)).isDirectory()) await walk(full);
  }
}

await walk(fixturesDir);

for (const line of failures) {
  const seam = line.indexOf(':\n');
  echo`${ red('FAIL') } ${ cyan(line.slice(0, seam)) }\n${ line.slice(seam + 2) }`;
}
if (counts.failed > failures.length) echo`${ red(`... and ${ counts.failed - failures.length } more failures`) }`;
echo`\nAST engine vs babel: ${ green(counts.compared) } compared, ${ cyan(counts.skippedMethod) } unported-method skipped, ${ cyan(counts.skippedNoCase) } caseless skipped, ${ counts.failed ? red(counts.failed) : green(0) } failed`;
// corpus-presence canary - a walk or filter regression must not read green
if (counts.compared < 200) throw new Error(`ast-engine corpus collapsed: only ${ counts.compared } fixtures compared`);
if (counts.failed) throw new Error('Some ast-engine fixtures have failed');
