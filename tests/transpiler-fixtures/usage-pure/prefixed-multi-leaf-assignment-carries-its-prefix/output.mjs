import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A prefixed multi-leaf assignment carries its prefix into the one read it performs.
function g() {
  log();
  return [1, [2]];
}
let s7, f7;
const _ref = (n++, g());
s7 = _findLastMaybeArray(_ref);
f7 = _flatMaybeArray(_ref);
use(s7, f7);