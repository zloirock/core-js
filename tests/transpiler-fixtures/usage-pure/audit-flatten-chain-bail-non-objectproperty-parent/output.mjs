import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Single-element ArrayPattern `[{ Array: { from } }] = [globalThis]` is transparent when init mirrors it.
// Flatten must descend through the array wrapper and emit a clean polyfill alias for `from`.
const from = _Array$from;
const of = _Array$of;
export { from, of };