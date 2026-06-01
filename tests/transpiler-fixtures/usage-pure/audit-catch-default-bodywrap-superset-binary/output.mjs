import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// catch-default IIFE arrow whose body is a binary expr (`[1].at(0) + 1`) is a STRICT SUPERSET of
// the inner `.at` call, so relocating the default composes `.at` as an inner-substitution inside
// the body-wrap (distinct from the equal-range-dup path where body and call cover the same range)
try {} catch (_ref) {
  var _ref2;
  let it = (_ref2 = _getIteratorMethod(_ref)) === void 0 ? (() => {
    var _ref3;
    return _atMaybeArray(_ref3 = [1]).call(_ref3, 0) + 1;
  })() : _ref2;
  it;
}