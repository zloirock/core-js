import _Array$from from "@core-js/pure/actual/array/from";
// bodyless `if` (single-statement form) with a SequenceExpression-wrapped init
// containing a polyfillable call. the lifted SE prefix goes into a block, and the cloned
// subtree's `Array.from(xs)` still gets visited and polyfilled on the second pass -
// no nested polyfill should be lost during the body-lift rewrite
if (cond) {
  _Array$from(xs), Array;
  var from = _Array$from;
}