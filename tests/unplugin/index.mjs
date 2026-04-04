import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';

const { readdir, readFile, readJson, rm, stat, writeFile } = fs;
const { join } = path;
const { cyan, green, red, yellow } = chalk;

const { OVERWRITE } = process.env;
const UTF8 = { encoding: 'utf8' };
const ROOT = path.resolve('../..').replaceAll('\\', '/');

// eslint-disable-next-line promise/prefer-await-to-then -- ok
const exists = file => fs.access(file).then(() => true, () => false);

const fixturesDir = path.resolve('../transpiler-fixtures');

let passed = 0;
let failed = 0;
let skipped = 0;

function normalize(code) {
  return code.replaceAll('\\\\', '/').replaceAll(ROOT, '<CWD>').trim();
}

// strip "use strict" and var declarations for cross-plugin comparison:
// Babel adds "use strict" and hoists vars to function scope; unplugin prepends vars at file top
function stripBoilerplate(code) {
  return code.split('\n')
    .filter(l => !/^\s*["']use strict["']/.test(l) && !/^\s*var /.test(l))
    .join('\n').trim();
}

function extractImports(code) {
  return code.split('\n').filter(l => l.startsWith('import ')).sort().join('\n');
}

function label(directory) {
  return `fixtures/${ path.relative(fixturesDir, directory) }`;
}

function fail(directory, ...lines) {
  failed++;
  echo(red(`${ cyan(label(directory)) } failed${ lines.length ? ':' : '' }`));
  for (const line of lines) echo`  ${ line }`;
}

function reportDiff(actual, expected) {
  const al = actual.split('\n');
  const el = expected.split('\n');
  for (let i = 0; i < Math.max(al.length, el.length); i++) {
    if (al[i] !== el[i]) {
      return `${ yellow(`line ${ i + 1 }:`) }\n    expected: ${ el[i] ?? '(missing)' }\n    actual:   ${ al[i] ?? '(missing)' }`;
    }
  }
}

function mapOptions(babelOptions) {
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

async function loadOptions(directory) {
  for (const file of ['options.json', 'options.mjs']) {
    const full = join(directory, file);
    if (!await exists(full)) continue;
    return file.endsWith('.json') ? readJson(full, UTF8) : (await import(full)).default;
  }
  return null;
}

const SKIP_DIRS = new Set([
  'source-script',
  'cjs-transform-export',
]);

async function runFixture(directory) {
  const dirName = path.basename(directory);
  if (SKIP_DIRS.has(dirName) || dirName.includes('-flow-') || dirName.startsWith('flow-')) {
    skipped++;
    return;
  }

  const babelOptions = await loadOptions(directory);
  if (!babelOptions) {
    skipped++;
    return;
  }
  const pluginOptions = mapOptions(babelOptions);
  if (!pluginOptions) {
    skipped++;
    return;
  }

  // error fixtures
  const errorFile = join(directory, 'error.txt');
  if (await exists(errorFile)) {
    const expected = (await readFile(errorFile, UTF8)).trim()
      .replace(/^\[BABEL\] [^:]+: /, '')
      .replace(/\n? ?\(While processing:.*\)$/s, '')
      .trim();
    try {
      createPlugin(pluginOptions).transform('x;', 'test.js');
      fail(directory, 'expected error but none thrown');
    } catch (error) {
      if (error.message.trim() === expected) {
        passed++;
        echo`${ cyan(label(directory)) } ${ green('passed') }`;
      } else {
        fail(directory, `expected: ${ expected }`, `actual:   ${ error.message.trim() }`);
      }
    }
    return;
  }

  const outputFile = join(directory, 'output.mjs');
  if (!await exists(outputFile)) {
    skipped++;
    return;
  }

  try {
    const source = await readFile(join(directory, 'input.mjs'), UTF8);
    const plugin = createPlugin(pluginOptions);
    const logs = [];
    const origLog = console.log;
    console.log = (...a) => logs.push(a.map(String).join(' '));
    const testId = babelOptions.filename || 'input.tsx';
    let result = plugin.transform(source, testId);
    if (result === null && source.includes('<') && !source.includes('jsx') && !source.includes('/>')) {
      result = plugin.transform(source, babelOptions.filename || 'input.ts');
    }
    console.log = origLog;

    const actual = normalize(result?.code ?? source);
    const babelOutput = normalize(await readFile(outputFile, UTF8));

    // debug output
    const debugFile = join(directory, 'debug.txt');
    if (await exists(debugFile)) {
      const expectedDebug = normalize(await readFile(debugFile, UTF8));
      const actualDebug = logs.length ? normalize(logs.join('\n')) : '';
      if (actualDebug !== expectedDebug) {
        return fail(directory, `debug mismatch: ${ actualDebug.split('\n').at(-1) || '(empty)' }`);
      }
    }

    // entry-global / usage-global: body is preserved, compare imports only
    if (pluginOptions.method !== 'usage-pure') {
      const actualImports = extractImports(actual);
      const expectedImports = extractImports(babelOutput);
      if (actualImports === expectedImports) {
        passed++;
        echo`${ cyan(label(directory)) } ${ green('passed') }`;
      } else {
        fail(directory, reportDiff(actualImports, expectedImports));
      }
      return;
    }

    // usage-pure: full output comparison
    const unpluginOutputFile = join(directory, 'output-unplugin.mjs');
    const hasUnpluginOutput = await exists(unpluginOutputFile);

    if (OVERWRITE) {
      if (stripBoilerplate(actual) === stripBoilerplate(babelOutput)) await rm(unpluginOutputFile, { force: true });
      else await writeFile(unpluginOutputFile, actual, UTF8);
      return echo`${ cyan(label(directory)) } ${ yellow('written') }`;
    }

    const expected = hasUnpluginOutput ? normalize(await readFile(unpluginOutputFile, UTF8)) : stripBoilerplate(babelOutput);
    const comparable = hasUnpluginOutput ? actual : stripBoilerplate(actual);

    if (comparable === expected) {
      passed++;
      echo`${ cyan(label(directory)) } ${ green('passed') }`;
    } else {
      fail(directory, reportDiff(comparable, expected));
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

echo(`\nPassed: ${ green(passed) }, Failed: ${ failed ? red(failed) : green(failed) }, Skipped: ${ yellow(skipped) }`);
if (failed) throw new Error('Some tests have failed');
