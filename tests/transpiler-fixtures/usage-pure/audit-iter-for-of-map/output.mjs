import _Map from "@core-js/pure/actual/map/constructor";
// non-emission lock: `for (const e of map)` stays raw in pure mode; iterator-instance
// dispatch on `Map.prototype` requires an `Iterator.from` anchor and is intentionally
// not auto-emitted.
for (const x of new _Map()) {}