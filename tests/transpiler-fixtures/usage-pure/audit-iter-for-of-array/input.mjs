// non-emission lock: `for (const x of array)` stays raw in pure mode; iterator-instance
// dispatch on `Array.prototype` requires an `Iterator.from` anchor and is intentionally
// not auto-emitted.
for (const x of arr) {}
