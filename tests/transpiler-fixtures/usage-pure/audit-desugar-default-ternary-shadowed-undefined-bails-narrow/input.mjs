// `undefined` is a legal identifier name - ECMA allows shadowing via
// `function (undefined)` param. The destructure-default ternary recogniser
// MUST bail when the bare-`undefined` test slot resolves to a local binding,
// since the comparison no longer fires the runtime nullish check. `_ref` is
// also untyped, so the receiver's resulting type is unconstrained and the
// dispatch must reach the generic instance helper rather than Maybe-array
function fn(_ref, undefined) {
  var arr = _ref === undefined ? [1, 2, 3] : _ref;
  return arr.at(0);
}
export { fn };
