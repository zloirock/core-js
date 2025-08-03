const { transformAsync } = require('@babel/core');
const { strictEqual } = require('node:assert');

const { access, readdir, readFile, readJson, stat, writeFile } = fs;
const { join } = path;
const { cyan, green, yellow } = chalk;

const { OVERWRITE } = process.env;
const UTF8 = { encoding: 'utf8' };

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
  const result = (await transformAsync(source, options)).code;
  const expected = join(directory, 'output.mjs');

  // eslint-disable-next-line promise/prefer-await-to-then -- ok
  if (OVERWRITE || !await access(expected).then(() => true, () => false)) {
    await writeFile(expected, result, UTF8);
    return echo`${ cyan(expected) } ${ yellow('created') }`;
  }

  strictEqual(String(await readFile(expected, UTF8)), result);
  echo`${ cyan(directory) } ${ green('passed') }`;
}

await handleDirectory('./fixtures');
