import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _includes from "@core-js/pure/actual/instance/includes";
// All reachable write values survive rewriting; a partial join retains its initializer.
let r;
const effects = [];
function f(c) {
  var _ref;
  let x = [];
  if (c) x = _joinMaybeArray(_ref = [1, 2]).call(_ref, '-');else x = [];
  return _includes(x).call(x, '1');
}
r = [f(true), f(false)];