import { deepEqual, ok } from 'node:assert/strict';

const knownBuiltInReturnTypes = await fs.readJson('packages/core-js-compat/known-built-in-return-types.json');

const VALID_HINTS = new Set([
  // primitives
  'bigint',
  'boolean',
  'number',
  'string',
  'symbol',
  'undefined',
  // object types
  'Arguments',
  'Array',
  'ArrayBuffer',
  'AsyncDisposableStack',
  'AsyncIterator',
  'DisposableStack',
  'Function',
  'Iterator',
  'Map',
  'Object',
  'Promise',
  'Set',
  'SharedArrayBuffer',
  'TypedArray',
  'URL',
  'URLSearchParams',
  'WeakMap',
  'WeakSet',
]);

ok(knownBuiltInReturnTypes.globalMethods, 'has globalMethods');
ok(knownBuiltInReturnTypes.globalProperties, 'has globalProperties');
ok(knownBuiltInReturnTypes.staticMethods, 'has staticMethods');
ok(knownBuiltInReturnTypes.staticProperties, 'has staticProperties');
ok(knownBuiltInReturnTypes.instanceMethods, 'has instanceMethods');
ok(knownBuiltInReturnTypes.instanceProperties, 'has instanceProperties');

// validate flat maps (globalMethods, globalProperties)
for (const kind of ['globalMethods', 'globalProperties']) {
  for (const [name, hint] of Object.entries(knownBuiltInReturnTypes[kind])) {
    ok(typeof name === 'string' && name, `${ kind }.${ name }: name is non-empty string`);
    ok(VALID_HINTS.has(hint), `${ kind }.${ name }: hint '${ hint }' is valid`);
  }
}

// validate nested maps (staticMethods, staticProperties, instanceMethods, instanceProperties)
for (const kind of ['staticMethods', 'staticProperties', 'instanceMethods', 'instanceProperties']) {
  for (const [className, members] of Object.entries(knownBuiltInReturnTypes[kind])) {
    ok(typeof className === 'string' && className, `${ kind }: class name is non-empty string`);
    for (const [member, hint] of Object.entries(members)) {
      ok(typeof member === 'string' && member, `${ kind }.${ className }.${ member }: name is non-empty string`);
      ok(VALID_HINTS.has(hint), `${ kind }.${ className }.${ member }: hint '${ hint }' is valid`);
    }
  }
}

// spot-check representative entries across all tables and hint types
// globalMethods — each primitive hint type
deepEqual(knownBuiltInReturnTypes.globalMethods.parseInt, 'number');
deepEqual(knownBuiltInReturnTypes.globalMethods.isNaN, 'boolean');
deepEqual(knownBuiltInReturnTypes.globalMethods.atob, 'string');
deepEqual(knownBuiltInReturnTypes.globalMethods.fetch, 'Promise');
// globalProperties
deepEqual(knownBuiltInReturnTypes.globalProperties.NaN, 'number');
deepEqual(knownBuiltInReturnTypes.globalProperties.undefined, 'undefined');
deepEqual(knownBuiltInReturnTypes.globalProperties.arguments, 'Arguments');
// staticProperties
deepEqual(knownBuiltInReturnTypes.staticProperties.Math.PI, 'number');
deepEqual(knownBuiltInReturnTypes.staticProperties.Symbol.iterator, 'symbol');
// staticMethods — each object hint type
deepEqual(knownBuiltInReturnTypes.staticMethods.Object.keys, 'Array');
deepEqual(knownBuiltInReturnTypes.staticMethods.Promise.all, 'Promise');
deepEqual(knownBuiltInReturnTypes.staticMethods.Iterator.from, 'Iterator');
deepEqual(knownBuiltInReturnTypes.staticMethods.BigInt.asIntN, 'bigint');
deepEqual(knownBuiltInReturnTypes.staticMethods.URL.parse, 'URL');
deepEqual(knownBuiltInReturnTypes.staticMethods.Uint8Array.fromBase64, 'TypedArray');
// instanceMethods — each object hint type
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.filter, 'Array');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Promise.then, 'Promise');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Iterator.map, 'Iterator');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Iterator.toArray, 'Array');
deepEqual(knownBuiltInReturnTypes.instanceMethods.String.matchAll, 'Iterator');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Symbol.valueOf, 'symbol');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Set.union, 'Set');
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncDisposableStack.move, 'AsyncDisposableStack');
deepEqual(knownBuiltInReturnTypes.instanceMethods.SharedArrayBuffer.slice, 'SharedArrayBuffer');
// instanceProperties
deepEqual(knownBuiltInReturnTypes.instanceProperties.Function.name, 'string');
deepEqual(knownBuiltInReturnTypes.instanceProperties.RegExp.flags, 'string');
deepEqual(knownBuiltInReturnTypes.instanceProperties.URL.searchParams, 'URLSearchParams');
deepEqual(knownBuiltInReturnTypes.instanceProperties.ArrayBuffer.detached, 'boolean');

echo(chalk.green('known-built-in-return-types tested'));
