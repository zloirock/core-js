import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A pristine prototype can serve both default properties directly.
// No parameter work can observe a delay between their reads.
function read(_ref = Array.prototype) {
  let at = _atMaybeArray(_ref);
  let flat = _flatMaybeArray(_ref);
  return [at, flat];
}
export const methods = read();