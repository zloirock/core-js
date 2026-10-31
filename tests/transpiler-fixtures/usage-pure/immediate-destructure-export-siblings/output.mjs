import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
var _ref;
// An exported extraction keeps both neighboring initializers in source order.
// Its receiver is captured once; the private capture is not exported.
const events = [];
const values = [4, 5];
function source() {
  _pushMaybeArray(events).call(events, 'source');
  return values;
}
export const before = (_pushMaybeArray(events).call(events, 'before'), 0);
const _ref2 = source();
export const method = (_ref = _atMaybeArray(_ref2)) === void 0 ? (_pushMaybeArray(events).call(events, 'default'), () => -1) : _ref;
export const {
  length: size
} = _ref2;
export const after = (_pushMaybeArray(events).call(events, 'after'), method.call(values, -1));
export { events };