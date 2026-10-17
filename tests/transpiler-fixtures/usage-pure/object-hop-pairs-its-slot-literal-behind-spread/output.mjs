import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function literalBehindSpread(extra) {
  const _ref = [1, 2];
  const {
    w: {}
  } = {
    ...extra,
    w: _ref
  };
  const behindSpreadAt = _atMaybeArray(_ref);
  return behindSpreadAt;
}
export default [literalBehindSpread({})];