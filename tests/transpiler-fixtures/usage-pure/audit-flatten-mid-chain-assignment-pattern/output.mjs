import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Mid-chain `AssignmentPattern` default `{ Array: { from } = {} }` is transparent over proxy globals.
// `globalThis.Array` is always defined, so the default never fires and flatten emits a clean polyfill alias.
const from = _Array$from;
const of = _Array$of;
export { from, of };