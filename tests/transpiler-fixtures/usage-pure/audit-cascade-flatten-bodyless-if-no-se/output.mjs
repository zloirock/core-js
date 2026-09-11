import _Array$from from "@core-js/pure/actual/array/from";
// `if (cond) ({Array:{from}} = globalThis);` - bodyless control with cascade-flatten
// destructure. inserting after a bodyless slot wraps it in a BlockStatement but the original
// path still points at the unwrapped slot, so a later remove of the original statement drops
// the whole block (including the polyfill assignment). force-wrap up-front keeps it intact
let from;
if (cond) from = _Array$from;
console.log(from);