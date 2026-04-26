// `for (const ch of string)`: the iteration protocol on `String.prototype` must be
// polyfilled so the for-of loop has a working iterator.
for (const x of str) {}