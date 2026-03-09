const { transformAsync } = require('@babel/core');
const { strictEqual } = require('node:assert');

const { _: args } = argv;
const { access, readdir, readFile, readJson, rm, stat, writeFile } = fs;
const { join } = path;
const { cyan, green, red, yellow } = chalk;

const { OVERWRITE } = process.env;
const UTF8 = { encoding: 'utf8' };
const ROOT = path.resolve('../..').replaceAll('\\', '/');

// eslint-disable-next-line promise/prefer-await-to-then -- ok
const exists = file => access(file).then(() => true, () => false);

function normalizeOutput(code) {
  return code.replaceAll('\\\\', '/').replaceAll(ROOT, '<CWD>');
}

let passed = 0;
let failed = 0;

function pass(directory) {
  passed++;
  echo`${ cyan(directory) } ${ green('passed') }`;
}

async function runFixture(directory) {
  const source = await readFile(join(directory, 'input.mjs'), UTF8);
  const options = await readJson(join(directory, 'options.json'), UTF8);
  const errorFile = join(directory, 'error.txt');
  const outputFile = join(directory, 'output.mjs');

  let result, error;
  try {
    result = normalizeOutput((await transformAsync(source, options)).code);
  } catch (transformError) {
    error = transformError;
  }

  const actualFile = error ? errorFile : outputFile;
  const staleFile = error ? outputFile : errorFile;
  const actual = error ? normalizeOutput(error.message) : result;

  if (OVERWRITE) {
    await rm(staleFile, { force: true });
    await writeFile(actualFile, actual, UTF8);
    return echo`${ cyan(actualFile) } ${ yellow('created') }`;
  }

  if (await exists(staleFile)) {
    failed++;
    echo(red(`${ cyan(directory) } failed: ${ error ? 'unexpected error' : 'expected an error but transform succeeded' }`));
    return;
  }

  if (!await exists(actualFile)) {
    await writeFile(actualFile, actual, UTF8);
    return echo`${ cyan(actualFile) } ${ yellow('created') }`;
  }

  try {
    strictEqual(String(await readFile(actualFile, UTF8)), actual);
    pass(directory);
  } catch (equalError) {
    failed++;
    echo(red(`${ cyan(directory) } failed:`));
    echo(equalError.message);
  }
}

async function walkFixtures(directory) {
  const names = await readdir(directory);
  if (names.includes('input.mjs')) return runFixture(directory);
  for (const name of names) {
    const subdirectory = join(directory, name);
    if ((await stat(subdirectory)).isDirectory()) await walkFixtures(subdirectory);
  }
}

await walkFixtures(args.length ? `./fixtures/${ args[0] }` : './fixtures');

echo(`\nPassed: ${ green(passed) }, Failed: ${ failed ? red(failed) : green(failed) }`);

if (failed) throw new Error('Some tests have failed');
