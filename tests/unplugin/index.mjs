import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';

const { readdir, readFile, readJson } = fs;
const { join } = path;
const { cyan, green, red, yellow } = chalk;

const UTF8 = { encoding: 'utf8' };
const ROOT = path.resolve('../..').replaceAll('\\', '/');

// eslint-disable-next-line promise/prefer-await-to-then -- ok
const exists = file => fs.access(file).then(() => true, () => false);

function normalizeOutput(code) {
  return code.replaceAll('\\\\', '/').replaceAll(ROOT, '<CWD>').trim();
}

const fixturesDir = path.resolve('../../tests/babel-plugin/fixtures');

let passed = 0;
let failed = 0;
let skipped = 0;

function label(directory) {
  return `fixtures/${ path.relative(fixturesDir, directory) }`;
}

function pass(directory) {
  passed++;
  echo`${ cyan(label(directory)) } ${ green('passed') }`;
}

// Map babel plugin options to unplugin options
function mapOptions(babelOptions) {
  const plugins = babelOptions.plugins || [];
  for (const plugin of plugins) {
    if (Array.isArray(plugin) && plugin[0] === '@core-js') {
      const opts = { ...plugin[1] };
      // Map babel top-level targets to plugin option
      if (!opts.targets && babelOptions.targets) opts.targets = babelOptions.targets;
      // Map babel caller to bundler name
      const callerName = babelOptions.caller?.name;
      if (callerName === 'babel-loader') opts.bundler = 'webpack';
      return opts;
    }
  }
  return null;
}

async function runFixture(directory) {
  const source = await readFile(join(directory, 'input.mjs'), UTF8);
  const jsonFile = join(directory, 'options.json');
  const mjsFile = join(directory, 'options.mjs');
  let babelOptions;
  if (await exists(jsonFile)) {
    babelOptions = await readJson(jsonFile, UTF8);
  } else if (await exists(mjsFile)) {
    babelOptions = (await import(mjsFile)).default;
  } else {
    skipped++;
    return;
  }
  const pluginOptions = mapOptions(babelOptions);
  if (!pluginOptions) {
    skipped++;
    return;
  }
  const fixtureFilename = babelOptions.filename;

  // Skip fixtures that test babel-specific or not-yet-implemented behavior
  const dirName = path.basename(directory);
  if (
    // babel caller API: source-script (CJS require output)
    dirName === 'source-script'
    // Flow syntax: oxc-parser doesn't support Flow
    || dirName.includes('-flow-')
  ) {
    skipped++;
    return;
  }

  // Validation error fixtures: expect createPlugin or transform to throw
  const errorFile = join(directory, 'error.txt');
  if (await exists(errorFile)) {
    const expectedError = (await readFile(errorFile, UTF8)).trim();
    try {
      const plugin = createPlugin(pluginOptions);
      plugin.transform('x;', 'test.js');
      echo(red(`${ cyan(label(directory)) } failed: expected error but none thrown`));
      failed++;
    } catch (error) {
      // Strip Babel-specific wrapping from expected message for comparison
      // e.g., '[BABEL] unknown file: Incorrect plugin mode (While processing: "...")' → 'Incorrect plugin mode'
      const actualMsg = error.message;
      const strippedExpected = expectedError
        .replace(/^\[BABEL\] [^:]+: /, '')
        .replace(/ \(While processing:.*$/, '')
        .split('\n')[0]
        .trim();
      if (actualMsg.includes(strippedExpected) || strippedExpected.includes(actualMsg)) {
        passed++;
      } else {
        echo(red(`${ cyan(label(directory)) } failed: wrong error`));
        echo(`  expected: ${ strippedExpected }`);
        echo(`  actual:   ${ actualMsg }`);
        failed++;
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
    const plugin = createPlugin(pluginOptions);
    // Try .tsx first (supports JSX + TS), fallback to .ts if parse fails
    // (angle bracket type assertions like <T>x conflict with JSX in .tsx)
    const testId = fixtureFilename || 'input.tsx';
    let result = plugin.transform(source, testId);
    if (result === null && source.includes('<') && !source.includes('jsx') && !source.includes('/>')) {
      result = plugin.transform(source, fixtureFilename || 'input.ts');
    }
    const actual = normalizeOutput(result?.code ?? source);
    const expected = normalizeOutput(await readFile(outputFile, UTF8));

    // For entry-global/usage-global: unplugin preserves original source (magic-string), Babel regenerates.
    // Compare only injected imports, not code body.
    // For usage-pure: compare import lines AND verify key replacement patterns.
    const extractImports = code => code.split('\n')
      .filter(line => line.startsWith('import '))
      .sort()
      .join('\n');
    const actualImports = extractImports(actual);
    const expectedImports = extractImports(expected);

    if (pluginOptions.method === 'usage-pure') {
      // For pure mode, compare: (1) same import set, (2) no original global references remain
      // The code body differs (magic-string vs Babel codegen), so we only check imports
      // and verify that expected pure import bindings are used in the output
      const expectedBindings = expected.split('\n')
        .filter(line => line.startsWith('import '))
        .map(line => line.match(/^import (?<binding>\S+)/)?.groups.binding)
        .filter(Boolean);
      const allBindingsUsed = expectedBindings.every(b => actual.includes(b));

      if (actualImports === expectedImports && allBindingsUsed) {
        pass(directory);
      } else {
        failed++;
        echo(red(`${ cyan(label(directory)) } failed:`));
        const actualSet = new Set(actualImports.split('\n'));
        const expectedSet = new Set(expectedImports.split('\n'));
        const missing = [...expectedSet].filter(l => !actualSet.has(l));
        const extra = [...actualSet].filter(l => !expectedSet.has(l));
        if (missing.length) echo`  ${ yellow('missing:') } ${ missing.slice(0, 3).join(', ') }${ missing.length > 3 ? ` +${ missing.length - 3 }` : '' }`;
        if (extra.length) echo`  ${ yellow('extra:') } ${ extra.slice(0, 3).join(', ') }${ extra.length > 3 ? ` +${ extra.length - 3 }` : '' }`;
        const unusedBindings = expectedBindings.filter(b => !actual.includes(b));
        if (unusedBindings.length) echo`  ${ yellow('unused bindings:') } ${ unusedBindings.join(', ') }`;
      }
    } else if (actualImports === expectedImports) {
      pass(directory);
    } else {
      failed++;
      echo(red(`${ cyan(label(directory)) } failed:`));
      const actualArr = actualImports.split('\n');
      const expectedArr = expectedImports.split('\n');
      const actualSet = new Set(actualArr);
      const expectedSet = new Set(expectedArr);
      const missing = expectedArr.filter(l => !actualSet.has(l));
      const extra = actualArr.filter(l => !expectedSet.has(l));
      if (missing.length) echo`  ${ yellow('missing:') } ${ missing.slice(0, 3).join(', ') }${ missing.length > 3 ? ` +${ missing.length - 3 }` : '' }`;
      if (extra.length) echo`  ${ yellow('extra:') } ${ extra.slice(0, 3).join(', ') }${ extra.length > 3 ? ` +${ extra.length - 3 }` : '' }`;
    }
  } catch (error) {
    failed++;
    echo(red(`${ cyan(label(directory)) } failed: ${ error.message }`));
  }
}

for (const mode of ['entry-global', 'usage-global', 'usage-pure']) {
  const modeDir = join(fixturesDir, mode);
  const fixtures = (await readdir(modeDir)).sort();
  for (const fixture of fixtures) {
    const dir = join(modeDir, fixture);
    if ((await fs.stat(dir)).isDirectory()) {
      await runFixture(dir);
    }
  }
}

echo(`\nPassed: ${ green(passed) }, Failed: ${ failed ? red(failed) : green(failed) }, Skipped: ${ yellow(skipped) }`);
if (failed) throw new Error('Some tests have failed');
