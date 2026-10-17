import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A closed caller supplies an array receiver and selects only Array dispatchers.
// Each method is read once at function entry after the arguments finish.
function read(_ref, _unused = void 0) {
  let at = _atMaybeArray(_ref);
  let flat = _flatMaybeArray(_ref);
  return [at, flat];
}
export const result = read([1, [2]]);