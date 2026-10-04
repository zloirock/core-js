import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A destructuring assignment in a parameter default evaluates its array-producing call once.
// Reentry from the effectful key retains each invocation's receiver and both method targets.
let calls = 0;
let inner;
let busy = false;
function built() {
  return [++calls, [9]];
}
function reenter() {
  if (!busy) {
    busy = true;
    inner = read();
  }
}
function read(at, flat, value = (() => {
  var _ref;
  return _ref = built(), null == _ref ? _ref[""] : (reenter(), at = _atMaybeArray(_ref)), flat = _flatMaybeArray(_ref), _ref;
})()) {
  return [at.call(value, 0), flat.call(value)[0], value];
}
export const result = [read(), inner, calls];