import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// All reachable write values survive rewriting; a partial join retains its initializer.
let r;
const effects = [];
function f(c) {
  var _ref;
  let x = _flatMaybeArray(_ref = [9]).call(_ref);
  if (c) x = _padStartMaybeString('ab').call('ab', 3);
  return _at(x).call(x, -1);
}
r = [f(true), f(false)];