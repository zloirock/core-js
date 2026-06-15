import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A spread argument at or before a destructure-pattern parameter slot shifts the arg->param
// mapping, so the destructured member cannot be narrowed from the literal arg - the inferred return
// type (and thus the `.at` receiver) widens to the generic helper.
function f(a: any, {
  x
}) {
  return x;
}
declare const args: any[];
_at(_ref = f(...args, {
  x: [1, 2, 3]
})).call(_ref, 0);