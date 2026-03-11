import { deepEqual, ok } from 'node:assert/strict';

const knownBuiltInReturnTypes = await fs.readJson('packages/core-js-compat/known-built-in-return-types.json');
const VALID_HINTS = new Set([
  'string', 'number', 'boolean', 'bigint', 'symbol',
  'Array', 'ArrayBuffer', 'AsyncDisposableStack', 'DisposableStack', 'Function',
  'Iterator', 'Map', 'Object', 'Promise', 'Set', 'SharedArrayBuffer', 'TypedArray', 'WeakMap', 'WeakSet',
]);

ok(knownBuiltInReturnTypes.static, 'has static');
ok(knownBuiltInReturnTypes.instance, 'has instance');

for (const [kind, classes] of Object.entries(knownBuiltInReturnTypes)) {
  for (const [className, methods] of Object.entries(classes)) {
    ok(typeof className === 'string' && className, `${ kind }: class name is non-empty string`);
    for (const [method, hint] of Object.entries(methods)) {
      ok(typeof method === 'string' && method, `${ kind }.${ className }.${ method }: method name is non-empty string`);
      ok(VALID_HINTS.has(hint), `${ kind }.${ className }.${ method }: hint '${ hint }' is valid`);
    }
  }
}

// spot-check some known entries
deepEqual(knownBuiltInReturnTypes.static.Object.keys, 'Array');
deepEqual(knownBuiltInReturnTypes.static.JSON.stringify, 'string');
deepEqual(knownBuiltInReturnTypes.static.Number.parseInt, 'number');
deepEqual(knownBuiltInReturnTypes.static.Array.isArray, 'boolean');
deepEqual(knownBuiltInReturnTypes.static.Math.floor, 'number');
deepEqual(knownBuiltInReturnTypes.static.Date.now, 'number');
deepEqual(knownBuiltInReturnTypes.static.Promise.all, 'Promise');
deepEqual(knownBuiltInReturnTypes.static.Reflect.ownKeys, 'Array');
deepEqual(knownBuiltInReturnTypes.instance.Array.filter, 'Array');
deepEqual(knownBuiltInReturnTypes.instance.Array.every, 'boolean');
deepEqual(knownBuiltInReturnTypes.instance.Array.indexOf, 'number');
deepEqual(knownBuiltInReturnTypes.instance.Array.join, 'string');
deepEqual(knownBuiltInReturnTypes.instance.String.toLowerCase, 'string');
deepEqual(knownBuiltInReturnTypes.instance.String.includes, 'boolean');
deepEqual(knownBuiltInReturnTypes.instance.String.split, 'Array');
deepEqual(knownBuiltInReturnTypes.instance.Date.getTime, 'number');
deepEqual(knownBuiltInReturnTypes.instance.Date.toISOString, 'string');
deepEqual(knownBuiltInReturnTypes.instance.Promise.then, 'Promise');
deepEqual(knownBuiltInReturnTypes.instance.Set.union, 'Set');
deepEqual(knownBuiltInReturnTypes.instance.Map.has, 'boolean');
deepEqual(knownBuiltInReturnTypes.instance.Number.toFixed, 'string');
deepEqual(knownBuiltInReturnTypes.instance.RegExp.test, 'boolean');
deepEqual(knownBuiltInReturnTypes.instance.TypedArray.filter, 'TypedArray');
deepEqual(knownBuiltInReturnTypes.instance.ArrayBuffer.slice, 'ArrayBuffer');
deepEqual(knownBuiltInReturnTypes.instance.Iterator.map, 'Iterator');
deepEqual(knownBuiltInReturnTypes.instance.Iterator.toArray, 'Array');
deepEqual(knownBuiltInReturnTypes.instance.Symbol.valueOf, 'symbol');
deepEqual(knownBuiltInReturnTypes.instance.DataView.getFloat64, 'number');
deepEqual(knownBuiltInReturnTypes.instance.DisposableStack.move, 'DisposableStack');
deepEqual(knownBuiltInReturnTypes.instance.Function.bind, 'Function');
deepEqual(knownBuiltInReturnTypes.instance.WeakMap.set, 'WeakMap');
deepEqual(knownBuiltInReturnTypes.instance.WeakSet.add, 'WeakSet');
deepEqual(knownBuiltInReturnTypes.static.Array.fromAsync, 'Array');
deepEqual(knownBuiltInReturnTypes.static.ArrayBuffer.isView, 'boolean');
deepEqual(knownBuiltInReturnTypes.static.Iterator.from, 'Iterator');
deepEqual(knownBuiltInReturnTypes.static.Symbol.for, 'symbol');
deepEqual(knownBuiltInReturnTypes.static.BigInt.asIntN, 'bigint');
deepEqual(knownBuiltInReturnTypes.static.Error.isError, 'boolean');
deepEqual(knownBuiltInReturnTypes.static.JSON.isRawJSON, 'boolean');
deepEqual(knownBuiltInReturnTypes.static.Uint8Array.fromBase64, 'TypedArray');
deepEqual(knownBuiltInReturnTypes.static.Map.groupBy, 'Map');
deepEqual(knownBuiltInReturnTypes.static.Atomics.isLockFree, 'boolean');

echo(chalk.green('known-built-in-return-types tested'));
