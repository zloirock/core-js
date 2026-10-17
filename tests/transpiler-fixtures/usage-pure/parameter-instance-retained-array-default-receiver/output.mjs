import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A retained parameter default keeps the prototype receiver's method family.
// The computed key and native sibling consume the captured receiver in source order.
const events = [];
function read(_ref = void 0) {
  let _ref3 = false;
  let [[_ref2]] = _ref === void 0 ? (_ref3 = true, [[Array.prototype]]) : _ref,
    {} = _ref2,
    {
      at: first
    } = _ref3 ? {
      "at": _atMaybeArray(_ref2)
    } : _ref2,
    {
      ["flat"]: second
    } = (_pushMaybeArray(events).call(events, 'key'), _ref3 ? {
      "flat": _flatMaybeArray(_ref2)
    } : _ref2),
    {
      length
    } = _ref2;
  return [typeof first, typeof second, _joinMaybeArray(events).call(events, ',')];
}
export const result = read();