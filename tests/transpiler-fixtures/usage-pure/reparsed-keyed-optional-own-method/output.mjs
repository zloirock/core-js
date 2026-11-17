import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
var _ref, _ref2, _ref3;
// An own null method keeps the optional call and its continuation guarded.
function get(value) {
  observe();
  return value;
}
export const own = null == (_ref = (_ref2 = get({
  at: null
}))[key(), 'at']) ? void 0 : _toFixedMaybeNumber(_ref3 = _ref.call(_ref2, arg())).call(_ref3, 1);