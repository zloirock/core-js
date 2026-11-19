import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A stable prototype default beside inert parameter work supplies both instance methods.
function read(first = 0, _ref = Array.prototype, last = 0) {
  let at = _atMaybeArray(_ref);
  let flat = _flatMaybeArray(_ref);
  return [first, at, flat, last];
}
const result = read(effect(), undefined, effect());
export { result };