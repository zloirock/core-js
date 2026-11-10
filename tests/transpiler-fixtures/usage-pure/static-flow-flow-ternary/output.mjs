import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// All reachable write values survive rewriting; a partial join retains its initializer.
let r;
const effects = [];
function f(c, d) {
  var _ref;
  let x;
  if (c) x = d ? _flatMaybeArray(_ref = [1, [7]]).call(_ref) : _padStartMaybeString('ab').call('ab', 3);else x = 'str';
  return _at(x).call(x, -1);
}
r = [f(true, true), f(true, false), f(false, false)];