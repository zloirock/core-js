import _at from "@core-js/pure/actual/instance/at";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// All reachable write values survive rewriting; a partial join retains its initializer.
let r;
const effects = [];
function f(c) {
  let x = [1];
  if (c) x = _padStartMaybeString('ab').call('ab', 3);else x = [2];
  return _at(x).call(x, -1);
}
r = [f(true), f(false)];