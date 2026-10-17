import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A retained parameter default keeps the prototype receiver's method family.
// The computed key and native sibling consume the captured receiver in source order.
const events = [];
function read(_ref = void 0) {
  let _ref3 = false;
  let [[_ref2]] = _ref === void 0 ? (_ref3 = true, [[String.prototype]]) : _ref,
    {} = _ref2,
    {
      at: first
    } = _ref3 ? {
      "at": _atMaybeString(_ref2)
    } : _ref2,
    {
      ["includes"]: second
    } = (_pushMaybeArray(events).call(events, 'key'), _ref3 ? {
      "includes": _includesMaybeString(_ref2)
    } : _ref2),
    {
      length
    } = _ref2;
  return [typeof first, typeof second, _joinMaybeArray(events).call(events, ',')];
}
export const result = read();