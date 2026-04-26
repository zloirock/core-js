import _Set from "@core-js/pure/actual/set/constructor";
// `for (const x of set)`: the iteration protocol on `Set.prototype` must be polyfilled
// so the for-of loop has a working iterator.
for (const x of new _Set()) {}