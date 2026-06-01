import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// catch-default block-bodied IIFE (`(function () { return [1].at(0); })()`): the inner `.at` memo
// declares `_ref` via a scoped-var INSERT at the block (not an arrow body-wrap overwrite), so the
// relocate keeps the insert as a splice while composing the `.at` overwrite separately
try {} catch (_ref) {
  var _ref2;
  let it = (_ref2 = _getIteratorMethod(_ref)) === void 0 ? function () {
    var _ref3;
    return _atMaybeArray(_ref3 = [1]).call(_ref3, 0);
  }() : _ref2;
  it;
}