import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// IIFE invoking an arrow whose param has a destructure-with-default: `(({from} = Array) => from([1,2,3]))(Set)`.
// caller's `Set` beats the default `Array` at runtime (default fires only when the arg is undefined),
// so the synth swap must target the IIFE arg - not the default - to keep the polyfill aligned with runtime
const r = (({ from } = { from: _Array$from }) => from([1, 2, 3]))(_Set);