import { equal, match, ok } from 'node:assert/strict';
import expectedFailures from './expected-failures.js';
import run from './harness.mjs';
import preprocessor from './preprocessor.js';

for (const file of [
  'Array/prototype/map/length.js',
  'AsyncDisposableStack/constructor.js',
  'DataView/prototype/getFloat16/return-values.js',
  'DataView/prototype/setFloat16/set-values-little-endian-order.js',
  'DisposableStack/constructor.js',
  'Object/prototype/toString/symbol-tag-non-str-builtin.js',
  'SuppressedError/length.js',
  'Uint8Array/fromBase64/alphabet.js',
  'Uint8Array/prototype/toHex/results.js',
]) {
  const fullPath = `node_modules/test262/test/built-ins/${ file }`;
  ok(await fs.pathExists(fullPath), fullPath);
  for (const separator of ['/', '\\']) {
    const test = { file: fullPath.replaceAll('/', separator) };
    equal(preprocessor(test), test, file);
  }
}

for (const file of [
  'Array/prototype/map/not-a-constructor.js',
  'DataView/prototype/getInt8/return-values.js',
  'Function/prototype/toString/built-in-function-object.js',
  'Intl/Collator/length.js',
  'Object/internals/DefineOwnProperty/probe.js',
  'RegExp/property-escapes/probe.js',
  'Uint8ArrayOther/fromBase64/probe.js',
]) {
  equal(preprocessor({ file: `test/built-ins/${ file }` }), null, file);
}

equal(new Set(expectedFailures).size, expectedFailures.length, 'No duplicate expected failures');
for (const file of expectedFailures) {
  const fullPath = `node_modules/test262/test/${ file }`;
  ok(await fs.pathExists(fullPath), fullPath);
  equal(preprocessor({ file: fullPath }), null, file);
  equal(preprocessor({ file: fullPath.replaceAll('/', '\\') }), null, file);
  const sibling = { file: `${ fullPath }.other.js` };
  equal(preprocessor(sibling), sibling, 'Expected failures match complete paths');
}

const test262Dir = await fs.mkdtemp(path.join(os.tmpdir(), '-core-js-test262-'));
try {
  await fs.writeJson(path.join(test262Dir, 'package.json'), { version: '5.0.0' });
  for (const file of ['assert.js', 'sta.js']) {
    await fs.copy(`node_modules/test262/harness/${ file }`, path.join(test262Dir, 'harness', file));
  }

  const metadata = '/*---\ndescription: Test the core-js test262 runner\nesid: sec-array.prototype.map\n---*/\n';
  const body = 'if ([1].map(function (it) { return it + 1; })[0] !== 2) throw new Error("Broken map");\n';
  const failure = 'throw new Error("This test must be excluded");\n';
  const fixtures = {
    'Array/prototype/map/probe.js': metadata + body,
    'Array/prototype/map/.local/probe.js': metadata + body,
    'Array/prototype/map/nested_FIXTURE/probe.js': metadata + failure,
    'Uint8Array/fromHex/probe.js': metadata + body,
    'Array/prototype/map/feature-excluded.js': metadata.replace('esid:', 'features: [regexp-v-flag]\nesid:') + failure,
    'DataView/prototype/setFloat16/immutable-buffer.js': metadata.replace('esid:', 'features: [immutable-arraybuffer]\nesid:') + failure,
    'Error/prototype/stack/probe.js': metadata.replace('esid:', 'features: [error-stack-accessor]\nesid:') + failure,
    'Function/prototype/toString/probe.js': metadata + failure,
  };
  for (const [file, contents] of Object.entries(fixtures)) {
    await fs.outputFile(path.join(test262Dir, 'test/built-ins', file), contents);
  }
  await fs.outputFile(path.join(test262Dir, 'local/built-ins/Array/probe.js'), metadata + body);
  if (expectedFailures.length) {
    await fs.outputFile(path.join(test262Dir, 'test', expectedFailures[0]), metadata + failure);
  }

  const prelude = path.join(test262Dir, 'prelude.js');
  const suite = path.basename(test262Dir);
  const builtIns = `${ suite }/test/built-ins`;
  const map = `${ builtIns }/Array/prototype/map`;
  const runFixture = (...patterns) => within(() => {
    $.cwd = path.dirname(test262Dir);
    return run(patterns, { test262Dir, prelude }).nothrow().quiet();
  });
  await fs.writeFile(prelude, '');
  // A leading dash in a real glob is part of the pattern.
  const passed = await runFixture(`${ builtIns }/**/*.js`);
  equal(passed.exitCode, 0, passed.toString());
  match(passed.stdout, /Ran 4 tests\s+4 passed\s+0 failed/);

  const probe = path.sep === '/' ? 'pr\\obe.js' : 'probe.js';
  const selected = await runFixture(`${ map }/${ probe }`, `${ map }/.local/probe.js`, `${ suite }/local/built-ins/Array/probe.js`);
  equal(selected.exitCode, 0, selected.toString());
  match(selected.stdout, /Ran 6 tests\s+6 passed\s+0 failed/);

  const missing = await runFixture(`${ map }/Probe.js`, `${ map }/nested_FIXTURE/probe.js`);
  equal(missing.exitCode, 1, missing.toString());
  match(missing.stderr, /No Test262 files match .*Probe\.js/);
  match(missing.stderr, /No Test262 files match .*nested_FIXTURE/);
  const mixed = await runFixture(`${ map }/probe.js`, `${ builtIns }/**/missing-*.js`);
  equal(mixed.exitCode, 1, mixed.toString());
  match(mixed.stderr, /No Test262 files match .*missing-\*\.js/);

  const excluded = await runFixture(`${ builtIns }/Function/prototype/toString/probe.js`, `${ map }/feature-excluded.js`);
  equal(excluded.exitCode, 0, excluded.toString());
  match(excluded.stdout, /Ran 0 tests/);

  await fs.writeFile(prelude, 'Array.prototype.map = function () { return []; };\n');
  const failed = await runFixture();
  equal(failed.exitCode, 1, failed.toString());
  match(failed.stdout, /Ran 4 tests\s+0 passed\s+4 failed/);
} finally {
  await fs.remove(test262Dir);
}

echo(chalk.green('test262 runner regression tests passed'));
