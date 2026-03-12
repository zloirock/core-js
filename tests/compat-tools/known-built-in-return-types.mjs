import { deepEqual, ok } from 'node:assert/strict';

const knownBuiltInReturnTypes = await fs.readJson('packages/core-js-compat/known-built-in-return-types.json');
const VALID_HINTS = new Set([
  'string', 'number', 'boolean', 'bigint', 'symbol',
  'Array', 'ArrayBuffer', 'AsyncDisposableStack', 'DisposableStack', 'Function',
  'Iterator', 'Map', 'Object', 'Promise', 'Set', 'SharedArrayBuffer', 'TypedArray', 'WeakMap', 'WeakSet',
]);

ok(knownBuiltInReturnTypes.staticMethods, 'has staticMethods');
ok(knownBuiltInReturnTypes.staticProperties, 'has staticProperties');
ok(knownBuiltInReturnTypes.instanceMethods, 'has instanceMethods');
ok(knownBuiltInReturnTypes.instanceProperties, 'has instanceProperties');

for (const [kind, classes] of Object.entries(knownBuiltInReturnTypes)) {
  for (const [className, members] of Object.entries(classes)) {
    ok(typeof className === 'string' && className, `${ kind }: class name is non-empty string`);
    for (const [member, hint] of Object.entries(members)) {
      ok(typeof member === 'string' && member, `${ kind }.${ className }.${ member }: name is non-empty string`);
      ok(VALID_HINTS.has(hint), `${ kind }.${ className }.${ member }: hint '${ hint }' is valid`);
    }
  }
}

// spot-check some known entries
deepEqual(knownBuiltInReturnTypes.staticMethods.Object.keys, 'Array');
deepEqual(knownBuiltInReturnTypes.staticMethods.JSON.stringify, 'string');
deepEqual(knownBuiltInReturnTypes.staticMethods.Number.parseInt, 'number');
deepEqual(knownBuiltInReturnTypes.staticMethods.Array.isArray, 'boolean');
deepEqual(knownBuiltInReturnTypes.staticMethods.Math.floor, 'number');
deepEqual(knownBuiltInReturnTypes.staticMethods.Date.now, 'number');
deepEqual(knownBuiltInReturnTypes.staticMethods.Promise.all, 'Promise');
deepEqual(knownBuiltInReturnTypes.staticMethods.Reflect.ownKeys, 'Array');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.filter, 'Array');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.every, 'boolean');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.indexOf, 'number');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.join, 'string');
deepEqual(knownBuiltInReturnTypes.instanceMethods.String.toLowerCase, 'string');
deepEqual(knownBuiltInReturnTypes.instanceMethods.String.includes, 'boolean');
deepEqual(knownBuiltInReturnTypes.instanceMethods.String.split, 'Array');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Date.getTime, 'number');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Date.toISOString, 'string');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Promise.then, 'Promise');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Set.union, 'Set');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Map.has, 'boolean');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Number.toFixed, 'string');
deepEqual(knownBuiltInReturnTypes.instanceMethods.RegExp.test, 'boolean');
deepEqual(knownBuiltInReturnTypes.instanceMethods.TypedArray.filter, 'TypedArray');
deepEqual(knownBuiltInReturnTypes.instanceMethods.ArrayBuffer.slice, 'ArrayBuffer');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Iterator.map, 'Iterator');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Iterator.toArray, 'Array');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Symbol.valueOf, 'symbol');
deepEqual(knownBuiltInReturnTypes.instanceMethods.DataView.getFloat64, 'number');
deepEqual(knownBuiltInReturnTypes.instanceMethods.DisposableStack.move, 'DisposableStack');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Function.bind, 'Function');
deepEqual(knownBuiltInReturnTypes.instanceMethods.WeakMap.set, 'WeakMap');
deepEqual(knownBuiltInReturnTypes.instanceMethods.WeakSet.add, 'WeakSet');
deepEqual(knownBuiltInReturnTypes.staticMethods.Array.fromAsync, 'Array');
deepEqual(knownBuiltInReturnTypes.staticMethods.ArrayBuffer.isView, 'boolean');
deepEqual(knownBuiltInReturnTypes.staticMethods.Iterator.from, 'Iterator');
deepEqual(knownBuiltInReturnTypes.staticMethods.Symbol.for, 'symbol');
deepEqual(knownBuiltInReturnTypes.staticMethods.BigInt.asIntN, 'bigint');
deepEqual(knownBuiltInReturnTypes.staticMethods.Error.isError, 'boolean');
deepEqual(knownBuiltInReturnTypes.staticMethods.JSON.isRawJSON, 'boolean');
deepEqual(knownBuiltInReturnTypes.staticMethods.Uint8Array.fromBase64, 'TypedArray');
deepEqual(knownBuiltInReturnTypes.staticMethods.Map.groupBy, 'Map');
deepEqual(knownBuiltInReturnTypes.staticMethods.Atomics.isLockFree, 'boolean');
deepEqual(knownBuiltInReturnTypes.staticMethods.Object.hasOwn, 'boolean');
deepEqual(knownBuiltInReturnTypes.staticMethods.String.fromCharCode, 'string');
deepEqual(knownBuiltInReturnTypes.staticMethods.Promise.try, 'Promise');
deepEqual(knownBuiltInReturnTypes.staticMethods.Reflect.has, 'boolean');
deepEqual(knownBuiltInReturnTypes.staticMethods.Date.UTC, 'number');
deepEqual(knownBuiltInReturnTypes.staticProperties.Math.PI, 'number');
deepEqual(knownBuiltInReturnTypes.staticProperties.Number.MAX_SAFE_INTEGER, 'number');
deepEqual(knownBuiltInReturnTypes.staticProperties.Symbol.iterator, 'symbol');
deepEqual(knownBuiltInReturnTypes.instanceProperties.Array.length, 'number');
deepEqual(knownBuiltInReturnTypes.instanceProperties.Function.name, 'string');
deepEqual(knownBuiltInReturnTypes.instanceProperties.Map.size, 'number');
deepEqual(knownBuiltInReturnTypes.instanceProperties.RegExp.flags, 'string');
deepEqual(knownBuiltInReturnTypes.instanceProperties.URL.pathname, 'string');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Boolean.toString, 'string');
deepEqual(knownBuiltInReturnTypes.instanceMethods.Error.toString, 'string');
deepEqual(knownBuiltInReturnTypes.instanceMethods.SharedArrayBuffer.slice, 'SharedArrayBuffer');
deepEqual(knownBuiltInReturnTypes.instanceMethods.URL.toJSON, 'string');
deepEqual(knownBuiltInReturnTypes.instanceMethods.URLSearchParams.has, 'boolean');
deepEqual(knownBuiltInReturnTypes.instanceMethods.URLSearchParams.getAll, 'Array');
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncDisposableStack.move, 'AsyncDisposableStack');
deepEqual(knownBuiltInReturnTypes.instanceProperties.ArrayBuffer.detached, 'boolean');
deepEqual(knownBuiltInReturnTypes.instanceProperties.DataView.byteOffset, 'number');
deepEqual(knownBuiltInReturnTypes.instanceProperties.Error.message, 'string');
deepEqual(knownBuiltInReturnTypes.instanceProperties.Set.size, 'number');
deepEqual(knownBuiltInReturnTypes.instanceProperties.SharedArrayBuffer.growable, 'boolean');
deepEqual(knownBuiltInReturnTypes.instanceProperties.String.length, 'number');
deepEqual(knownBuiltInReturnTypes.instanceProperties.TypedArray.byteLength, 'number');

echo(chalk.green('known-built-in-return-types tested'));
