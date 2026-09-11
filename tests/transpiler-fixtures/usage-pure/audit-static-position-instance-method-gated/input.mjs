// usage-pure mirror of the static-position gate: `Array.concat` reads an Array.prototype method off
// the Array CONSTRUCTOR (undefined at runtime), so it is NOT rewritten to a maybe-instance polyfill
// and stays `Array.concat(...)`. the valid static `Array.from` rewrites to the pure static import,
// and `Array.name` (a genuine Function.prototype member of the constructor) rewrites via the function variant
Array.concat([1, 2, 3]);
const arr = Array.from([4, 5, 6]);
const n = Array.name;
