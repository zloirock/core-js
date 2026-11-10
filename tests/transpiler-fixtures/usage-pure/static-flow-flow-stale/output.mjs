import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// All reachable write values survive rewriting; a partial join retains its initializer.
let r;
const effects = [];
function f(c) {
  var _ref;
  let x = _flatMaybeArray(_ref = [9]).call(_ref);
  if (c) x = 'ab';else x = 'cd';
  return _atMaybeString(x).call(x, -1);
}
r = [f(true), f(false)];