import _Array$from from "@core-js/pure/actual/array/from";
// IIFE with destructured param at non-zero position: `((a, {from}, c) => from(...))(X, Array, Y)`.
// receiver substitution must locate the second arg via `params.indexOf(objectPattern)` and
// rewrite the matching call argument, not the first
const r = ((_a, {
  from
}, _c) => from([1, 2, 3]))(0, {
  from: _Array$from
}, 1);
export { r };