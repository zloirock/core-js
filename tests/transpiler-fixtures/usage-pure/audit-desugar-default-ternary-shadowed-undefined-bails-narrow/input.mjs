// `undefined` is a legal identifier name; ECMA allows shadowing it via a `function (undefined)`
// param. the destructure-default ternary recogniser MUST bail when the bare-`undefined` test
// slot resolves to a local binding, since the comparison no longer fires the runtime nullish
// check. `_ref` is also untyped, so dispatch must reach the generic helper, not Maybe-array.
function fn(_ref, undefined) {
  var arr = _ref === undefined ? [1, 2, 3] : _ref;
  return arr.at(0);
}
export { fn };
