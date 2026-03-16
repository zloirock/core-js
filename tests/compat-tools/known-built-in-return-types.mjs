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
  'BigInt',
  'Boolean',
  'DataView',
  'Date',
  'DisposableStack',
  'DOMException',
  'Error',
  'Function',
  'Iterator',
  'Map',
  'Number',
  'Object',
  'Promise',
  'RegExp',
  'Set',
  'SharedArrayBuffer',
  'String',
  'Symbol',
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

// structural validation — every entry in every table has a valid shape
for (const kind of ['globalMethods', 'globalProperties']) {
  ok(knownBuiltInReturnTypes[kind], `has ${ kind }`);
  for (const [name, hint] of Object.entries(knownBuiltInReturnTypes[kind])) {
    ok(isValidHint(hint), `${ kind }.${ name }: hint '${ JSON.stringify(hint) }' is valid`);
  }
}

for (const kind of ['staticMethods', 'staticProperties', 'instanceMethods', 'instanceProperties', 'staticTypeGuards']) {
  ok(knownBuiltInReturnTypes[kind], `has ${ kind }`);
  for (const [className, members] of Object.entries(knownBuiltInReturnTypes[kind])) {
    for (const [member, hint] of Object.entries(members)) {
      ok(isValidHint(hint), `${ kind }.${ className }.${ member }: hint '${ JSON.stringify(hint) }' is valid`);
    }
  }
}

// spot-checks — one per distinct hint shape
// simple primitive / object
deepEqual(knownBuiltInReturnTypes.globalMethods.parseInt, { type: 'number' });
deepEqual(knownBuiltInReturnTypes.globalMethods.fetch, { type: 'Promise' });
deepEqual(knownBuiltInReturnTypes.globalProperties.undefined, { type: 'undefined' });
deepEqual(knownBuiltInReturnTypes.staticProperties.Symbol.iterator, { type: 'symbol' });
// element hint
deepEqual(knownBuiltInReturnTypes.staticMethods.Object.keys, { type: 'Array', element: { type: 'string' } });
// resolved hint
deepEqual(knownBuiltInReturnTypes.staticMethods.Promise.all, { type: 'Promise', resolved: { type: 'Array' } });
// 'element' directive
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.at, 'element');
// 'inherit' directive
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.filter, { type: 'Array', element: 'inherit' });
// resolved 'inherit'
deepEqual(knownBuiltInReturnTypes.instanceMethods.Promise.finally, { type: 'Promise', resolved: 'inherit' });
// resolved 'element'
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncIterator.find, { type: 'Promise', resolved: 'element' });
// nested inherit
deepEqual(knownBuiltInReturnTypes.instanceMethods.Iterator.chunks, { type: 'Iterator', element: { type: 'Array', element: 'inherit' } });
// nested resolved
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncIterator.toArray, { type: 'Promise', resolved: { type: 'Array', element: 'inherit' } });
// deep nesting
deepEqual(knownBuiltInReturnTypes.instanceMethods.String.matchAll, { type: 'Iterator', element: { type: 'Array', element: { type: 'string' } } });
// instance property
deepEqual(knownBuiltInReturnTypes.instanceProperties.URL.searchParams, { type: 'URLSearchParams' });
// type guard
deepEqual(knownBuiltInReturnTypes.staticTypeGuards.Array.isArray, { type: 'Array' });
deepEqual(knownBuiltInReturnTypes.staticTypeGuards.Number.isFinite, { type: 'number' });

// globalProxies
ok(Array.isArray(knownBuiltInReturnTypes.globalProxies), 'globalProxies is array');
for (const proxy of knownBuiltInReturnTypes.globalProxies) {
  ok(typeof proxy === 'string' && proxy, `globalProxy '${ proxy }' is non-empty string`);
}

// constructors — structural validation
function isValidConstructorHint(hint) {
  if (typeof hint !== 'object' || hint === null) return false;
  if (hint.type !== null && !VALID_TYPES.has(hint.type)) return false;
  const validKeys = new Set(['type', 'element']);
  for (const key of Object.keys(hint)) if (!validKeys.has(key)) return false;
  if (hint.element !== undefined) return isValidHint(hint.element);
  return true;
}

const { constructors } = knownBuiltInReturnTypes;
ok(constructors, 'has constructors');
for (const [name, entry] of Object.entries(constructors)) {
  ok(isValidConstructorHint(entry.new), `constructor '${ name }.new': hint '${ JSON.stringify(entry.new) }' is valid`);
  ok(isValidConstructorHint(entry.call), `constructor '${ name }.call': hint '${ JSON.stringify(entry.call) }' is valid`);
}

// constructors — spot-checks: one per distinct constructor shape
// simple (new === call)
deepEqual(constructors.Array, { new: { type: 'Array' }, call: { type: 'Array' } });
// primitive wrapper (new: boxed object, call: primitive)
deepEqual(constructors.String, { new: { type: 'String' }, call: { type: 'string' } });
// null type
deepEqual(constructors.Object, { new: { type: null }, call: { type: null } });
// error mapping
deepEqual(constructors.AggregateError, { new: { type: 'Error' }, call: { type: 'Error' } });
// TypedArray with element
deepEqual(constructors.BigInt64Array, { new: { type: 'TypedArray', element: { type: 'bigint' } }, call: { type: 'TypedArray', element: { type: 'bigint' } } });
deepEqual(constructors.Float32Array, { new: { type: 'TypedArray', element: { type: 'number' } }, call: { type: 'TypedArray', element: { type: 'number' } } });
// readonly variant
deepEqual(constructors.ReadonlyArray, { new: { type: 'Array' }, call: { type: 'Array' } });

echo(chalk.green('known-built-in-return-types tested'));
