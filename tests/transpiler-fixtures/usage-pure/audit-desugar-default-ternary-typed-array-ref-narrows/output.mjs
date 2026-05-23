import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// destructuring-default desugar with TYPED `_ref?: number[]`. `commonType(default,
// refType)` folds (number[], number[] | undefined) to a strict array shape so the
// receiver narrow is sound. companion case to the untyped fixtures which fall back
// to the generic helper because a caller could pass any value
function fn(_ref?: number[]) {
  var arr = _ref === void 0 ? [1, 2, 3] : _ref;
  return _atMaybeArray(arr).call(arr, 0);
}
export { fn };