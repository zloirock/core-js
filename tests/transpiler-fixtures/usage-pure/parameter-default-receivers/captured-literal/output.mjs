import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A destructuring assignment in a parameter default retains its literal receiver.
// Reentry from the effectful key keeps each invocation's at and flat on its own array.
let calls = 0;
let inner;
let busy = false;
function reenter() {
  calls++;
  if (!busy) {
    busy = true;
    inner = read();
  }
}
function read(at, flat, value = (() => {
  var _ref;
  return _ref = [calls + 1, [9]], reenter(), at = _atMaybeArray(_ref), flat = _flatMaybeArray(_ref), _ref;
})()) {
  return [at.call(value, 0), flat.call(value)[0], value];
}
export const result = [read(), inner, calls];