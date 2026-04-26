import _Map from "@core-js/pure/actual/map/constructor";
// `for (const e of map)`: the iteration protocol on `Map.prototype` must be polyfilled
// so the for-of loop has a working iterator.
for (const x of new _Map()) {}