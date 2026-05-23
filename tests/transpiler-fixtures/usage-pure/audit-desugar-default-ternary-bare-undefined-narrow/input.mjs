// some transpilers emit the destructure default ternary against the bare
// `undefined` Identifier rather than the `void 0` UnaryExpression. Inference
// must accept the Identifier form too, with a scope-binding check guarding
// against shadowed locals named `undefined`. `_ref` is intentionally untyped:
// a caller can pass any value, so the result of the ternary is `default | _ref`
// and Maybe-array narrow on the receiver would be unsound - the resolver MUST
// fall through to the generic instance dispatch
function fn(_ref) {
  var arr = _ref === undefined ? [1, 2, 3] : _ref;
  return arr.at(0);
}
export { fn };
