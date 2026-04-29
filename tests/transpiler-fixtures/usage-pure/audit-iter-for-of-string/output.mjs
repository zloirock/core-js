// non-emission lock: `for (const ch of string)` stays raw in pure mode; iterator-
// instance dispatch on `String.prototype` requires an `Iterator.from` anchor and is
// intentionally not auto-emitted.
for (const x of str) {}