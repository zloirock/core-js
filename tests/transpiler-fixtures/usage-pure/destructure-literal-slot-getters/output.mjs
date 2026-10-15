import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// All literal slots finish before the nested receiver is captured and dispatched.
// A neighbouring getter must run once without leaving the instance read native.
const events = [];
const source = {
  get y() {
    _pushMaybeArray(events).call(events, 'y');
    return [1, 2];
  },
  get z() {
    _pushMaybeArray(events).call(events, 'z');
    return 1;
  }
};
const at = _atMaybeArray({
  y: source.y,
  z: source.z
}.y);