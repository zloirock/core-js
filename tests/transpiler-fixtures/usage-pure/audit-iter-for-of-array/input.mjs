// `for (const x of array)`: the iteration protocol on `Array.prototype` must be
// polyfilled so the for-of loop has a working iterator.
for (const x of arr) {}
