import { deepEqual, strictEqual } from 'node:assert/strict';

const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'core-js-canon-'));
const bootstrap = path.resolve('scripts/zxi.mjs').replaceAll(path.sep, '/');
const run = $({ cwd: directory, quiet: true, env: { ...process.env, HOME: directory, USERPROFILE: directory } });
const pkg = 'packages/core-js-compat';

async function canon(args, status = 0) {
  const result = await run({ nothrow: true })`zx -- ${ bootstrap } scripts/canon/index.mjs ${ args } --json`;
  strictEqual(result.exitCode, status, result.stderr);
  return JSON.parse(result.stdout);
}

function write(file, source) {
  return fs.outputFile(path.join(directory, file), source);
}

async function find(query) {
  return (await canon(['find', query])).results.map(entry => entry.file);
}

function commit() {
  return run`git -c user.name=canon -c user.email=canon@example.test commit -qm fixture`;
}

try {
  const missing = `${ pkg }/anonymous.js`;
  const documented = `${ pkg }/documented.js`;
  const named = `${ pkg }/named.js`;
  const other = `${ pkg }/other.js`;
  await write(missing, 'export default function () { return [1].map(x => x); }\n');
  await write(documented, '// The public contract.\nexport default\n  () => 1;\n');
  await write(named, 'function kestrel() {}\nexport default kestrel;\n');
  await write(other, 'export { default } from "./anonymous.js";\nconst methods = { default() {} };\n');

  const oldDate = new Date('2000-01-01');
  const namedFile = path.join(directory, named);
  await fs.utimes(namedFile, oldDate, oldDate);
  const contracts = await canon(['contracts']);
  deepEqual(contracts.map(({ file, name, line }) => [file, name, line]), [[missing, 'default', 1], [named, 'kestrel', 1]]);
  const defaults = (await canon(['find', 'default'])).results;
  deepEqual(defaults.filter(entry => entry.exported).map(({ file }) => file).sort(), [missing, documented]);
  const arrow = defaults.find(entry => entry.file === documented);
  strictEqual(arrow.contract, 'The public contract.');
  strictEqual(arrow.line, 3);
  deepEqual(await canon(['dupes']), []);

  // A same-length edit at its original mtime, then an unchanged file under a new path.
  await write(named, 'function wallaby() {}\nexport default wallaby;\n');
  await fs.utimes(namedFile, oldDate, oldDate);
  deepEqual(await find('wallaby'), [named]);
  deepEqual(await find('kestrel'), []);
  const renamed = `${ pkg }/renamed.js`;
  await fs.rename(namedFile, path.join(directory, renamed));
  deepEqual(await find('wallaby'), [renamed]);

  const cacheDir = path.join(directory, '.cache/core-js-canon');
  const [indexName] = await fs.readdir(cacheDir);
  const indexPath = path.join(cacheDir, indexName);
  const { fingerprints } = await fs.readJson(indexPath);
  await fs.writeJson(indexPath, { fingerprints });
  deepEqual(await find('wallaby'), [renamed]);
  await fs.utimes(indexPath, oldDate, oldDate);
  deepEqual(await find('wallaby'), [renamed]);
  strictEqual((await fs.stat(indexPath)).mtimeMs, oldDate.getTime());

  await run`git init -q`;
  await run`git config core.quotePath true`;
  await run`git add -- ${ pkg }`;
  await commit();
  const unicode = `${ pkg }/module \u03BB.mjs`;
  await write(unicode, 'export default () => 1;\nexport function wallaby() {}\n');
  async function checkDelta(ref) {
    const { added } = await canon(['delta', ref], 1);
    deepEqual(added.map(({ file, name, line, dups }) => [file, name, line, dups.map(entry => entry.file)]), [
      [unicode, 'default', 1, []],
      [unicode, 'wallaby', 2, [renamed]],
    ]);
  }
  await checkDelta('HEAD');
  await run`git add -- ${ unicode }`;
  await checkDelta('HEAD');
  await commit();
  await checkDelta('HEAD^..HEAD');
  deepEqual((await canon(['delta', 'HEAD'])).added, []);
  await fs.appendFile(path.join(directory, unicode), 'export function trackedEdit() {}\n');
  const { added } = await canon(['delta', 'HEAD'], 1);
  deepEqual(added.map(({ file, name, line }) => [file, name, line]), [[unicode, 'trackedEdit', 3]]);

  const bindings = `${ pkg }/bindings.mjs`;
  await write(bindings, [
    'export function loadFeature(savedData) { return savedData; }',
    'const methods = { loadFeature() {}, readFeature: () => {} };',
    'const readFeature = function readFeature() {};',
    'export { readFeature as publicFeature };',
    'const moduleData = 0;',
    'if (true) { const blockData = 1; var hoistedData = 2; }',
    'for (let loopData = 0; loopData < 1; loopData++) {}',
    'export { hoistedData };',
    '{ const loadFeature = () => {}; }',
    'function local() { var innerData = 0; }',
    'try { throw 0; } catch (caughtData) { var caughtData = 0, savedData = 1; }',
    'try { throw 0; } catch (caughtFeature) { var caughtFeature = () => {}; }',
    'export { caughtData, caughtFeature };',
    'export var { items: [patternFeature = moduleData], ...patternData } = { items: [] };',
    'var patternFeature = () => {}, patternData = 1;',
  ].join('\n'));
  const missingContracts = (await canon(['contracts'])).filter(entry => entry.file === bindings);
  deepEqual(missingContracts.map(({ name, line }) => [name, line]), [['loadFeature', 1], ['readFeature', 3], ['patternFeature', 15]]);
  const functions = (await canon(['find', 'feature'])).results;
  deepEqual(functions.map(({ name, line, exported }) => [name, line, exported]), [
    ['loadFeature', 1, true],
    ['loadFeature', 2, false],
    ['readFeature', 2, false],
    ['readFeature', 3, true],
    ['readFeature', 3, false],
    ['loadFeature', 9, false],
    ['caughtFeature', 12, false],
    ['patternFeature', 15, true],
  ]);
  const data = (await canon(['find', 'data'])).results;
  deepEqual(data.map(({ name, exported }) => [name, exported]), [
    ['moduleData', false],
    ['hoistedData', true],
    ['savedData', false],
    ['patternData', true],
  ]);
  const delta = await canon(['delta', 'HEAD'], 1);
  deepEqual(delta.added.filter(entry => entry.name.endsWith('Data')).map(entry => entry.name), [
    'moduleData', 'hoistedData', 'savedData', 'patternData',
  ]);
} finally {
  await fs.remove(directory);
}

echo(chalk.green('canon index and Git delta tested'));
