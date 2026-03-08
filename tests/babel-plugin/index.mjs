const { transformAsync } = require('@babel/core');
const { strictEqual } = require('node:assert');

const { _: args } = argv;
const { access, readdir, readFile, readJson, stat, writeFile } = fs;
const { join } = path;
const { cyan, green, red, yellow } = chalk;

const { OVERWRITE } = process.env;
const UTF8 = { encoding: 'utf8' };
const ROOT = path.resolve('../..').replaceAll('\\', '/');

function normalizeOutput(code) {
  return code.replaceAll(ROOT, '<CWD>');
}

let passed = 0;
let failed = 0;

async function handleDirectory(directory) {
  const subdirectories = await readdir(directory);
  if (!subdirectories.includes('input.mjs')) {
    for (const name of subdirectories) {
      const subdirectory = join(directory, name);
      if (!(await stat(subdirectory)).isDirectory()) continue;
      await handleDirectory(subdirectory);
    }
    return;
  }

  const source = await readFile(join(directory, 'input.mjs'), UTF8);
  const options = await readJson(join(directory, 'options.json'), UTF8);
  const result = normalizeOutput((await transformAsync(source, options)).code);
  const expected = join(directory, 'output.mjs');

  // eslint-disable-next-line promise/prefer-await-to-then -- ok
  if (OVERWRITE || !await access(expected).then(() => true, () => false)) {
    await writeFile(expected, result, UTF8);
    return echo`${ cyan(expected) } ${ yellow('created') }`;
  }

  try {
    strictEqual(String(await readFile(expected, UTF8)), result);
    passed++;
    echo`${ cyan(directory) } ${ green('passed') }`;
  } catch (error) {
    failed++;
    echo(red(`${ cyan(directory) } failed:`));
    echo(error.message);
  }
}

await handleDirectory(args.length ? `./fixtures/${ args[0] }` : './fixtures');

echo(`\nPassed: ${ green(passed) }, Failed: ${ failed ? red(failed) : green(failed) }`);

if (failed) throw new Error('Some tests have failed');
