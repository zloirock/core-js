// A destructuring ASSIGNMENT whose init runs code claims the static off a `||` / `??` left read off the
// realm, as the declaration does: a left the build serves (`Array`, `Object`, and `Number`, which core-js
// extends in place) leaves its right dead, the claim alone in place, and a prefix ahead of a quiet selection
// stays ahead of the claim - in a bodyless slot and in a sequence element too.
let of, fromEntries, from, hasOwn;
({ of } = globalThis.Array || (log(), Set));
if (ok) ({ fromEntries } = globalThis.Object || (log(), WeakMap));
export const pair = (({ from } = globalThis.Array ?? make()), from([1, 2]));
export const prefixed = (({ hasOwn } = (log(), globalThis.Object || Set)), hasOwn({}, 'k'));
let fromAsync;
if (ok) ({ fromAsync } = (log(), globalThis.Array || Map));
export { of, fromEntries, from, fromAsync };
let isInteger, isFinite, parseFloat;
({ isInteger } = globalThis.Number || (log(), WeakSet));
if (ok) ({ isFinite } = globalThis.Number || (log(), Iterator));
export const parsed = (({ parseFloat } = globalThis.Number ?? (make(), DisposableStack)), parseFloat('1'));
export { isInteger, isFinite };
