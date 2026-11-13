import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// An installed parameter default keeps both instance claims on the value written by the default.
let installed;
function read(first = 0, _ref = installed = [1], last = 0) {
  let at = _atMaybeArray(_ref);
  let flat = _flatMaybeArray(_ref);
  return [first, at, flat, last];
}
const result = read(effect(), undefined, effect());
export { installed, result };