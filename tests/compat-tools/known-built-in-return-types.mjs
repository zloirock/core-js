import { deepEqual, ok } from 'node:assert/strict';

const knownBuiltInReturnTypes = await fs.readJson('packages/core-js-compat/known-built-in-return-types.json');

const VALID_TYPES = new Set([
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

function isValidHint(hint) {
  // resolution directives (only valid in instance method hints)
  if (hint === 'element' || hint === 'inherit') return true;
  // normalized hint: always { type, element?, resolved? }
  if (typeof hint !== 'object' || hint === null) return false;
  if (!VALID_TYPES.has(hint.type)) return false;
  const validKeys = new Set(['type', 'element', 'resolved']);
  for (const key of Object.keys(hint)) if (!validKeys.has(key)) return false;
  const innerHint = hint.element ?? hint.resolved ?? null;
  return innerHint === null || isValidHint(innerHint);
}

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
    ok(isValidHint(hint), `${ kind }.${ name }: hint '${ JSON.stringify(hint) }' is valid`);
  }
}

// validate nested maps (staticMethods, staticProperties, instanceMethods, instanceProperties)
for (const kind of ['staticMethods', 'staticProperties', 'instanceMethods', 'instanceProperties']) {
  for (const [className, members] of Object.entries(knownBuiltInReturnTypes[kind])) {
    ok(typeof className === 'string' && className, `${ kind }: class name is non-empty string`);
    for (const [member, hint] of Object.entries(members)) {
      ok(typeof member === 'string' && member, `${ kind }.${ className }.${ member }: name is non-empty string`);
      ok(isValidHint(hint), `${ kind }.${ className }.${ member }: hint '${ JSON.stringify(hint) }' is valid`);
    }
  }
}

// spot-check representative entries across all tables
// globalMethods — normalized simple hints
deepEqual(knownBuiltInReturnTypes.globalMethods.parseInt, { type: 'number' });
deepEqual(knownBuiltInReturnTypes.globalMethods.isNaN, { type: 'boolean' });
deepEqual(knownBuiltInReturnTypes.globalMethods.atob, { type: 'string' });
deepEqual(knownBuiltInReturnTypes.globalMethods.fetch, { type: 'Promise' });
// globalProperties
deepEqual(knownBuiltInReturnTypes.globalProperties.NaN, { type: 'number' });
deepEqual(knownBuiltInReturnTypes.globalProperties.undefined, { type: 'undefined' });
deepEqual(knownBuiltInReturnTypes.globalProperties.arguments, { type: 'Arguments' });
// staticProperties
deepEqual(knownBuiltInReturnTypes.staticProperties.Math.PI, { type: 'number' });
deepEqual(knownBuiltInReturnTypes.staticProperties.Symbol.iterator, { type: 'symbol' });
// staticMethods
deepEqual(knownBuiltInReturnTypes.staticMethods.Object.keys, { type: 'Array', element: { type: 'string' } });
deepEqual(knownBuiltInReturnTypes.staticMethods.Promise.all, { type: 'Promise', resolved: { type: 'Array' } });
deepEqual(knownBuiltInReturnTypes.staticMethods.Iterator.from, { type: 'Iterator' });
deepEqual(knownBuiltInReturnTypes.staticMethods.BigInt.asIntN, { type: 'bigint' });
deepEqual(knownBuiltInReturnTypes.staticMethods.URL.parse, { type: 'URL' });
deepEqual(knownBuiltInReturnTypes.staticMethods.Uint8Array.fromBase64, { type: 'TypedArray', element: { type: 'number' } });
// staticMethods — structured hints with inner types
deepEqual(knownBuiltInReturnTypes.staticMethods.Object.entries, { type: 'Array', element: { type: 'Array' } });
deepEqual(knownBuiltInReturnTypes.staticMethods.Object.getOwnPropertyNames, { type: 'Array', element: { type: 'string' } });
deepEqual(knownBuiltInReturnTypes.staticMethods.Object.getOwnPropertySymbols, { type: 'Array', element: { type: 'symbol' } });
deepEqual(knownBuiltInReturnTypes.staticMethods.Reflect.ownKeys, { type: 'Array' });
deepEqual(knownBuiltInReturnTypes.staticMethods.Promise.allSettled, { type: 'Promise', resolved: { type: 'Array' } });
deepEqual(knownBuiltInReturnTypes.staticMethods.Array.fromAsync, { type: 'Promise', resolved: { type: 'Array' } });
// instanceMethods — simple normalized hints
deepEqual(knownBuiltInReturnTypes.instanceMethods.Promise.then, { type: 'Promise' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Iterator.map, { type: 'Iterator' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Symbol.valueOf, { type: 'symbol' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Set.union, { type: 'Set' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncDisposableStack.move, { type: 'AsyncDisposableStack' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.SharedArrayBuffer.slice, { type: 'SharedArrayBuffer' });
// instanceMethods — 'element' hints (element-returning methods)
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.at, 'element');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.find, 'element');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.pop, 'element');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Iterator.find, 'element');
deepEqual(knownBuiltInReturnTypes.instanceMethods.TypedArray.at, 'element');
deepEqual(knownBuiltInReturnTypes.instanceMethods.TypedArray.find, 'element');
deepEqual(knownBuiltInReturnTypes.instanceMethods.TypedArray.findLast, 'element');
// instanceMethods — 'inherit' hints (element-preserving methods)
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.filter, { type: 'Array', element: 'inherit' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.slice, { type: 'Array', element: 'inherit' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.values, { type: 'Iterator', element: 'inherit' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Iterator.toArray, { type: 'Array', element: 'inherit' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Iterator.toAsync, { type: 'AsyncIterator', element: 'inherit' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Iterator.chunks, { type: 'Iterator', element: { type: 'Array', element: 'inherit' } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Iterator.windows, { type: 'Iterator', element: { type: 'Array', element: 'inherit' } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncDisposableStack.disposeAsync, { type: 'Promise', resolved: { type: 'undefined' } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncIterator.every, { type: 'Promise', resolved: { type: 'boolean' } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncIterator.some, { type: 'Promise', resolved: { type: 'boolean' } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncIterator.forEach, { type: 'Promise', resolved: { type: 'undefined' } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncIterator.filter, { type: 'AsyncIterator', element: 'inherit' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncIterator.find, { type: 'Promise', resolved: 'element' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncIterator.toArray, { type: 'Promise', resolved: { type: 'Array', element: 'inherit' } });
// instanceMethods — structured hints with explicit inner types
deepEqual(knownBuiltInReturnTypes.instanceMethods.String.split, { type: 'Array', element: { type: 'string' } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.String.match, { type: 'Array', element: { type: 'string' } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.String.matchAll, { type: 'Iterator', element: { type: 'Array', element: { type: 'string' } } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.keys, { type: 'Iterator', element: { type: 'number' } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.entries, { type: 'Iterator', element: { type: 'Array' } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.URLSearchParams.getAll, { type: 'Array', element: { type: 'string' } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.URLSearchParams.keys, { type: 'Iterator', element: { type: 'string' } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.URLSearchParams.entries, { type: 'Iterator', element: { type: 'Array', element: { type: 'string' } } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.toSpliced, { type: 'Array' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.TypedArray.filter, { type: 'TypedArray', element: 'inherit' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.TypedArray.slice, { type: 'TypedArray', element: 'inherit' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.TypedArray.values, { type: 'Iterator', element: 'inherit' });
// keys yields indices (always number), entries yields [number, element] tuples (heterogeneous)
deepEqual(knownBuiltInReturnTypes.instanceMethods.TypedArray.keys, { type: 'Iterator', element: { type: 'number' } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.TypedArray.entries, { type: 'Iterator', element: { type: 'Array', element: { type: 'number' } } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Map.entries, { type: 'Iterator', element: { type: 'Array' } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Set.entries, { type: 'Iterator', element: { type: 'Array', element: 'inherit' } });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Set.values, { type: 'Iterator', element: 'inherit' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Set.keys, { type: 'Iterator', element: 'inherit' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Set.add, { type: 'Set', element: 'inherit' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Set.difference, { type: 'Set', element: 'inherit' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Set.intersection, { type: 'Set', element: 'inherit' });
// instanceProperties
deepEqual(knownBuiltInReturnTypes.instanceProperties.Function.name, { type: 'string' });
deepEqual(knownBuiltInReturnTypes.instanceProperties.RegExp.flags, { type: 'string' });
deepEqual(knownBuiltInReturnTypes.instanceProperties.URL.searchParams, { type: 'URLSearchParams' });
deepEqual(knownBuiltInReturnTypes.instanceProperties.ArrayBuffer.detached, { type: 'boolean' });

echo(chalk.green('known-built-in-return-types tested'));
