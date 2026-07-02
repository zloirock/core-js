// non-emission lock: `for (const x of set)` stays raw in pure mode; iterator-instance
// dispatch on `Set.prototype` requires an `Iterator.from` anchor and is intentionally
// not auto-emitted.
for (const x of new Set()) {}
