// A destructuring ASSIGNMENT whose init runs code over a `||` / `??` left read off the realm: a left the
// build serves (`Array`, `Object`, and `Number`, which core-js extends in place) leaves its right dead, which
// injects nothing; one it does not (`Int8Array`, whose statics live under the shared typed-array entries;
// `WeakRef`) keeps the right live: the static read off the selection - the left's own, or the right's
// (`keyFor`) - keeps its module beside the right's constructor, in a bodyless slot and in a sequence element too.
let of, fromEntries, from;
({ of } = globalThis.Array || (log(), Set));
if (ok) ({ fromEntries } = globalThis.Object || (log(), WeakMap));
export const pair = (({ from } = globalThis.Array ?? make()), from([1, 2]));
let fromAsync;
if (ok) ({ fromAsync } = (log(), globalThis.Array || Map));
export { of, fromEntries, from, fromAsync };
let isInteger, isFinite, parseFloat;
({ isInteger } = globalThis.Number || (log(), WeakSet));
if (ok) ({ isFinite } = globalThis.Number || (log(), Iterator));
export const parsed = (({ parseFloat } = globalThis.Number ?? (make(), DisposableStack)), parseFloat('1'));
export { isInteger, isFinite };
let int8Of, int8From, keyFor;
({ of: int8Of } = globalThis.Int8Array || (log(), AggregateError));
if (ok) ({ from: int8From } = globalThis.Int8Array || (log(), DataView));
export const symbolKey = (({ keyFor } = globalThis.WeakRef ?? (make(), Symbol)), keyFor(sym));
export { int8Of, int8From };
