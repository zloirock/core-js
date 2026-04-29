import _Array$from from "@core-js/pure/actual/array/from";
// IIFE with default-value param and no call arguments: caller doesn't supply the
// receiver, so the default expression `Array` is the one that runtime evaluates. the
// rewrite targets the default RHS instead of the (absent) call argument
const r = (({
  from
} = {
  from: _Array$from
}) => from([1, 2, 3]))();
export { r };