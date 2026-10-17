import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A caller mirror inside a parameter default owns the captured receiver in that activation.
// Native sibling getters close over that capture after the literal has been constructed.
function methods(_ref, _unused = void 0) {
  let at = _atMaybeArray(_ref);
  let flat = _flatMaybeArray(_ref);
  let {
    length
  } = _ref;
  return [at, flat, length];
}
export function read(result = methods([1, [2]])) {
  return result;
}