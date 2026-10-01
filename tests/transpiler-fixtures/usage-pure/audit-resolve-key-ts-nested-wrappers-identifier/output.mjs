import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// nested TS casts around a computed-key alias: `arr[((k) as any) as unknown]`. plugin
// peels through every wrapper layer (paren + TS `as`) to recover the underlying Identifier
// `k`, then follows its const binding to 'at' and polyfills Array.prototype.at accordingly
const arr = [1, 2, 3];
const k = 'at';
_atMaybeArray(arr).call(arr, 0);