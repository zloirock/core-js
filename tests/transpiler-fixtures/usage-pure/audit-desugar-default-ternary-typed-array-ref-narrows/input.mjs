// destructuring-default desugar with TYPED `_ref?: number[]`. the default and the ref type fold
// (number[], number[] | undefined) to a strict array shape, so the receiver narrow is sound.
// companion to the untyped fixtures, which fall back to the generic helper because a caller
// could pass any value.
function fn(_ref?: number[]) {
  var arr = _ref === void 0 ? [1, 2, 3] : _ref;
  return arr.at(0);
}
export { fn };
