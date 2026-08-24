// the AST engine's fixture gate: every fixture of a method the engine supports transforms
// with `engine: 'ast'` and the output must be STRUCTURALLY identical to the babel baseline
// `output.mjs` - both are AST renderers now, so a difference is a defect, never formatting
// (the text engine keeps its own byte-level runner and sidecars). methods join this gate as
// the migration lands them; a fixture of an unported method is counted, not compared
import { fileURLToPath } from 'node:url';
import { parseSync } from 'oxc-parser';
import {
  FIXTURE_SHARD, collectFixtures, defaultShardCount, emitShardSummary, runShards, shardSlice,
} from '../babel-plugin/fixture-shards.mjs';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { liftSfcLangSuffix } from '../../packages/core-js-unplugin/internals/plugin-helpers.js';
import { extractPluginOptions, inferTestId, loadBabelOptions, normalizeMachinePaths, shouldSkip } from './fixture-lang.mjs';
import { strip } from './structural.mjs';

const { pathExists, readFile } = fs;
const { _: args } = argv;
const { join } = path;
const { cyan, green, red } = chalk;

const UTF8 = { encoding: 'utf8' };
const fixturesDir = path.resolve('../transpiler-fixtures');

const AST_METHODS = new Set(['entry-global', 'usage-global', 'usage-pure']);

// fixtures whose babel BASELINE bakes an @babel/generator defect (EDGE row in the queue):
// the body compare would hold our correct print to a wrong baseline - the import-set
// assertion still stands. paired manifestation: cast-under-update baselines do not parse
// at all and take the same lane through the parse check
const BASELINE_GENERATOR_DEFECTS = new Set([
  // `(f || g)<string>` printed as `f || g<string>` - the instantiation reassociates onto `g`
  'ts-instantiation-host-priority-parens',
]);

const counts = { compared: 0, skippedMethod: 0, skippedNoCase: 0, failed: 0 };
const failures = [];
const failureLabels = [];

function fail(directory, detail) {
  counts.failed++;
  failureLabels.push(directory);
  if (failures.length < 15) failures.push(`${ directory }:\n${ detail }`);
}

// diagnostics are a CHANNEL, not noise: the debug report is a product surface with 65 baselines
// of its own, and letting it print past the runner both hides a divergence and buries the verdict
// under it. error shares the warnings channel - neither emitter distinguishes severity
function captureConsole() {
  const logs = [];
  const warns = [];
  const orig = { log: console.log, warn: console.warn, error: console.error };
  console.log = (...a) => logs.push(a.map(String).join(' '));
  console.warn = (...a) => warns.push(a.map(String).join(' '));
  console.error = (...a) => warns.push(a.map(String).join(' '));
  return { logs, warns, restore: () => Object.assign(console, orig) };
}

// the drifting `Using targets: { ... }` block collapses on BOTH sides - the text runner's rule,
// and the shared baselines are stored pre-collapsed
function collapseDriftingTargets(text) {
  return text === null ? text : text.replace(/Using targets: \{[^}]*\}/, 'Using targets: <RESOLVED>');
}

// the debug channel's baselines, the same either-baseline rule the output takes: `debug.txt` is
// babel's, `debug-unplugin.txt` records an ACCEPTED unplugin divergence, and landing on babel's
// proper is strictly closer. null when the fixture declares no debug output at all
async function debugBaselines(directory) {
  const out = [];
  for (const file of ['debug.txt', 'debug-unplugin.txt']) {
    const full = join(directory, file);
    if (await pathExists(full)) out.push(collapseDriftingTargets(normalizeMachinePaths(await readFile(full, UTF8)).trim()));
  }
  return out;
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
  // an `output-unplugin.mjs` sidecar records an ACCEPTED unplugin-vs-babel divergence
  // (environment-dependent targets resolution, a text-emitter spelling) - the ast leg may
  // match EITHER baseline: a sidecar the engine swap erases means the engine landed on the
  // babel shape proper, which is strictly closer than the recorded divergence
  const sidecarFile = join(directory, 'output-unplugin.mjs');
  const baseline = await pathExists(sidecarFile) ? await readFile(sidecarFile, UTF8) : await readFile(join(directory, 'output.mjs'), UTF8);
  const altBaseline = baseline !== null && await pathExists(sidecarFile) ? await readFile(join(directory, 'output.mjs'), UTF8) : null;
  counts.compared++;
  let astOut;
  let abstained;
  const { logs, warns, restore } = captureConsole();
  try {
    const result = createPlugin({ ...pluginOptions, engine: 'ast' }).transform(source, testId);
    abstained = result === null;
    astOut = normalizeMachinePaths(result?.code ?? source);
  } catch (error) {
    return fail(label, `ast transform threw: ${ error.message }`);
  } finally {
    restore();
  }
  // the diagnostics the transform just produced, held to their own baselines BEFORE the output
  // compare: a debug report that drifted is a defect of the same engine, and one nobody sees
  // while it prints past the runner
  if (warns.length) return fail(label, `unexpected diagnostics on the warnings channel:\n${ warns.join('\n') }`);
  const debugActual = logs.length ? collapseDriftingTargets(normalizeMachinePaths(logs.join('\n')).trim()) : null;
  const debugExpected = await debugBaselines(directory);
  if (debugExpected.length ? !debugExpected.includes(debugActual) : debugActual !== null) {
    return fail(label, `debug channel differs from the baseline\n--- ast:\n${ debugActual ?? '<none>' }`
      + `\n--- baseline:\n${ debugExpected[0] ?? '<none>' }`);
  }
  const astParsed = parseOrNull(testId, astOut);
  if (!astParsed) return fail(label, `ast output does not parse:\n${ astOut }`);
  const baselineParsed = parseOrNull(testId, baseline);
  // two degradations to the import-set lane, each with a reason the body compare cannot own:
  // an ABSTAIN (`null`) keeps the user's bytes while babel may reprint normalization-only
  // changes; and a baseline that DOES NOT PARSE has a babel-generator defect baked in (bare
  // cast under `++` and friends) - the read-side injection assertion is still ours to hold
  if (abstained || !baselineParsed || BASELINE_GENERATOR_DEFECTS.has(path.basename(directory))) {
    // both spellings, or this lane is blind exactly where it is the only check: usage-global
    // writes a BARE `import "core-js/modules/..."`, usage-pure a DEFAULT one off `@core-js/pure`.
    // the two package names normalize together, as the differential's own extractor does
    function importsOf(text) {
      const found = text.split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('import') && !trimmed.includes('require(')) return null;
        return /["'](?<path>@?core-js(?:\/pure)?\/[^"']+)["']/u.exec(trimmed)?.groups.path.replace('@core-js/pure', 'core-js');
      });
      return JSON.stringify(found.filter(Boolean).sort());
    }
    if (importsOf(astOut) !== importsOf(baseline) && (altBaseline === null || importsOf(astOut) !== importsOf(altBaseline))) {
      return fail(label, `import set differs from the babel baseline\n--- ast:\n${ astOut.trim() }\n--- babel:\n${ baseline.trim() }`);
    }
    return;
  }
  // a fixture whose babel chain carries OTHER real plugins (transform-typescript and
  // friends) bakes their work into the baseline body - the body is not ours to match, the
  // import set still is (mirrors the text runner's loose lane for the same reason)
  if ((babelOptions.plugins ?? []).some(plugin => !(Array.isArray(plugin) && plugin[0] === '@core-js'))) {
    function imports(program) {
      return JSON.stringify(program.body
        .map(node => node.type === 'ImportDeclaration' && node.source.value).filter(Boolean).sort());
    }
    const altParsed = altBaseline === null ? null : parseOrNull(testId, altBaseline);
    if (imports(astParsed.program) !== imports(baselineParsed.program)
      && (!altParsed || imports(astParsed.program) !== imports(altParsed.program))) {
      return fail(label, `import set differs from the babel baseline\n--- ast:\n${ astOut.trim() }\n--- babel:\n${ baseline.trim() }`);
    }
    return;
  }
  const astStripped = JSON.stringify(strip(astParsed.program));
  if (astStripped !== JSON.stringify(strip(baselineParsed.program))) {
    const altParsed = altBaseline === null ? null : parseOrNull(testId, altBaseline);
    if (!altParsed || astStripped !== JSON.stringify(strip(altParsed.program))) {
      return fail(label, `structurally different from the babel baseline\n--- ast:\n${ astOut.trim() }\n--- babel:\n${ baseline.trim() }`);
    }
  }
}

// a shard child receives the subtree filter via env (the zx CLI keeps the script name in
// argv._, so a positional arg would land off-by-one against the zxi-invoked parent)
const subtree = FIXTURE_SHARD ? process.env.FIXTURE_SUBTREE : args[0];
const fixtures = await collectFixtures(subtree ? `${ fixturesDir }/${ subtree }` : fixturesDir);

function logFailures() {
  for (const line of failures) {
    const seam = line.indexOf(':\n');
    echo`${ red('FAIL') } ${ cyan(line.slice(0, seam)) }\n${ line.slice(seam + 2) }`;
  }
  if (counts.failed > failures.length) {
    echo`${ red(`... and ${ counts.failed - failures.length } more failures; every failing fixture:`) }`;
    for (const label of failureLabels) echo`FAIL-LABEL ${ label }`;
  }
}

// a child reports through the marker only; the parent aggregates and decides the exit
if (FIXTURE_SHARD) {
  for (const directory of shardSlice(fixtures)) await runFixture(directory);
  logFailures();
  emitShardSummary(counts);
} else {
  const shards = defaultShardCount(fixtures.length);
  echo`${ green(`ast-engine fixtures: ${ cyan(fixtures.length) } in ${ cyan(shards) } shard(s); only failures are printed below`) }`;
  if (shards > 1) {
    Object.assign(counts, await runShards({
      script: fileURLToPath(import.meta.url), shards, extraEnv: subtree ? { FIXTURE_SUBTREE: subtree } : {},
    }));
  } else {
    for (const directory of fixtures) await runFixture(directory);
    logFailures();
  }
  // the family summary shape (`Passed / Failed / Skipped`), so composite logs read uniformly;
  // the skip split stays visible as the tail detail
  echo`\nPassed: ${ green(counts.compared - counts.failed) }, Failed: ${ counts.failed ? red(counts.failed) : green(0) }, Skipped: ${ cyan(counts.skippedMethod + counts.skippedNoCase) } (${ counts.skippedMethod } unported-method, ${ counts.skippedNoCase } caseless)`;
  // corpus-presence canary - a walk or filter regression must not read green; a subtree run
  // is a deliberate narrowing, so only the full corpus is held to it
  if (!subtree && counts.compared < 200) throw new Error(`ast-engine corpus collapsed: only ${ counts.compared } fixtures compared`);
  if (counts.failed) throw new Error('Some ast-engine fixtures have failed');
}
