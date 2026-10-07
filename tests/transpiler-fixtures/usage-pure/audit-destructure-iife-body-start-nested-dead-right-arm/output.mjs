import _Array$from from "@core-js/pure/actual/array/from";
// the IIFE arrow body is a nested logical whose leftmost operand is parenthesized in source and whose
// right arms carry effects (`(globalThis || g()) || h()`): the realm decides both levels, so both dead
// arms drop and the mirrored object from the deepest left stands alone at the body start, where both
// emitters parenthesise it
function f({
  Array: {
    from
  }
} = (() => ({
  Array: {
    from: _Array$from
  }
}))()) {
  return from;
}
f();