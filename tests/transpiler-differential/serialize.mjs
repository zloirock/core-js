// Shared, dependency-light serialization for the runtime oracle. Lives apart from harness.mjs so
// the stripped-realm worker can import it WITHOUT pulling in @babel/core (which internally uses some
// of the very builtins the worker strips, and would break under the strip preload).

import { isProxy } from 'node:util/types';

// Snapshot before a snippet can replace a realm constructor with an observable getter.
const { isArray } = Array;
const { stringify } = JSON;
const { isFinite } = Number;
const { getOwnPropertyDescriptor, getPrototypeOf } = Object;
const { keyFor } = Symbol;
const symbolDescription = Function.call.bind(getOwnPropertyDescriptor(Symbol.prototype, 'description').get);

// Escape user strings in the marker namespace, including when nested. JSON still owns
// property order, toJSON calls and cycle detection. Record null prototypes by object position
// outside the JSON, without re-reading the object or invoking a user proxy trap.
export function serialize(value) {
  let position = 0;
  let nullRecords = '';
  const json = stringify(value, function (key, item) {
    if (item === undefined) return isArray(this) && !isProxy(this) && !getOwnPropertyDescriptor(this, key) ? '__hole__' : '__undefined__';
    if (typeof item === 'string' && item.length > 1 && item[0] === '_' && item[1] === '_') return `__string__${ item }`;
    if (typeof item === 'function') return '__function__';
    if (typeof item === 'bigint') return `__bigint__${ item }`;
    if (typeof item === 'symbol') {
      const name = keyFor(item);
      return name === undefined ? `__symbol__${ stringify(symbolDescription(item)) }` : `__global_symbol__${ name }`;
    }
    if (typeof item === 'number') {
      if (item === 0 && 1 / item < 0) return '__-0__';
      if (!isFinite(item)) return `__${ item }__`;
    }
    if (item && typeof item === 'object') {
      if (!isProxy(item) && getPrototypeOf(item) === null) nullRecords += `${ nullRecords ? ' ' : '' }${ position }`;
      position++;
    }
    return item;
  });
  return nullRecords ? `null-prototypes[${ nullRecords }]${ json }` : json;
}

// a module's observable outcome as a stable string: OK + serialized (r, effects), or ERR + name
export function runtimeKey(result) {
  return result.ok ? `OK|${ serialize(result.r) }|${ serialize(result.effects) }` : `ERR|${ result.errorName }`;
}
