import _Array$from from "@core-js/pure/actual/array/from";
// IIFE with AssignmentPattern default and no call arguments: caller doesn't supply the
// receiver, so the default expression `Array` is the one that runtime evaluates. synth-swap
// rewrites the default RHS, not the (absent) call argument
const r = (({
  from
} = {
  from: _Array$from
}) => from([1, 2, 3]))();
export { r };