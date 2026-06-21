// some transpilers emit the destructure-default ternary against the bare `undefined`
// Identifier rather than the `void 0` UnaryExpression; inference must accept the Identifier form,
// with a scope check against shadowed `undefined` locals. `_ref` is untyped, so the result is
// `default | _ref` and a Maybe-array narrow would be unsound; dispatch must reach the generic helper.
function fn(_ref) {
  var arr = _ref === undefined ? [1, 2, 3] : _ref;
  return arr.at(0);
}
export { fn };
