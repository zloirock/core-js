import _Set from "@core-js/pure/actual/set/constructor";
// non-emission lock: `[...new Set()]` spread of a Set stays raw in pure mode; only the
// `Set` constructor is anchored, iterator-instance dispatch driven by spread requires
// an `Iterator.from` anchor and is intentionally not auto-emitted.
const a = [...new _Set()];