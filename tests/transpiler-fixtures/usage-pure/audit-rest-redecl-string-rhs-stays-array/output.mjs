import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a `var [...r]` redeclared in a block with a STRING right-hand side: the reaching redecl narrows
// the slot, but a rest-bound slot is ALWAYS an Array (the string spreads into a fresh array), never
// the RHS type. it must dispatch the array-specific `.at`, not the string-specific one that a
// RHS-typed narrow would pick.
var [...r] = [1, 2];
{
  var [...r] = "abc";
}
export const first = _atMaybeArray(r).call(r, 0);
export const second = _atMaybeArray(r).call(r, 1);