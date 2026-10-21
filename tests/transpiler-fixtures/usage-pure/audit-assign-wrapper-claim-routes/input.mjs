// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const log = [];
let flat, at, deep, kept, kw, named, keyed, other, stat, zn;
[{ flat }] = [globalThis.Array.prototype];
[{ at }, zn] = [globalThis.Array.prototype, 7];
[{ findLast: deep }] = [globalThis?.globalThis.Array.prototype];
[{ Array: { prototype: { copyWithin: kept } } }] = [(kw = globalThis)];
[{ Array: { keys: named } }] = [globalThis];
let markedName;
[{ Array: { keys: markedName } }] = [globalThis?.globalThis];
[{ [(log.push("k"), "flatMap")]: keyed, other }] = [Array.prototype];
[{ of: stat }, zn] = [Array, 7];
export { flat, at, deep, kept, kw, named, markedName, keyed, other, stat, zn, log };
