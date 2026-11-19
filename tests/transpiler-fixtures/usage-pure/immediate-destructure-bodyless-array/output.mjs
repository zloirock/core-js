import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// The array slot is captured once inside the conditional body.
// Its residual length read and method extraction keep their shared receiver.
const events = [];
const values = [4, 5];
function source() {
  _pushMaybeArray(events).call(events, 'source');
  return values;
}
if (enabled) var [_ref] = [source()],
  method = _atMaybeArray(_ref),
  {
    length: size
  } = _ref;
export { method, size, events };