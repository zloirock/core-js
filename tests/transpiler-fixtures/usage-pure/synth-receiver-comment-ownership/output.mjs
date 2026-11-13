import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Two instance methods retain the supplied prototype receiver.
// Its source comment prints once even when both dispatchers use the captured value.
function read(first = 0, _ref = Array /* receiver */.prototype, last = 0) {
  let at = _atMaybeArray(_ref);
  let flat = _flatMaybeArray(_ref);
  return [at, flat];
}
export const result = read(effect(), undefined, effect());