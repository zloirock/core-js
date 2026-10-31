import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A computed key runs after an effectful array initializer.
// The instance method reads that array once and retains its Array family.
const events = [];
function source() {
  _pushMaybeArray(events).call(events, 'source');
  return 1;
}
const _ref = [source()],
  method = (_pushMaybeArray(events).call(events, 'key'), _atMaybeArray(_ref));
export const result = method.call([8], 0);
export { events };