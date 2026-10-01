// `for (const e of map)`: the iteration protocol on `Map.prototype` must be polyfilled
// so the for-of loop has a working iterator.
for (const x of new Map()) {}
