import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// All reachable write values survive rewriting; a partial join retains its initializer.
let r;
const effects = [];
function f(c) {
  var _ref;
  let x = '';
  if (c) x = _flatMaybeArray(_ref = [1, [7]]).call(_ref);else x = 'str';
  return _at(x).call(x, -1);
}
r = [f(true), f(false)];