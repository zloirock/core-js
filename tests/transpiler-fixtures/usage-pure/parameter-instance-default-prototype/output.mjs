import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A parameter default mirrors the known constructor's prototype methods.
// A supplied object still reads its own properties and runs its own leaf default.
export function read({
  prototype: {
    at = _Array$from,
    flat
  }
} = {
  prototype: {
    at: _atMaybeArray(Array.prototype),
    flat: _flatMaybeArray(Array.prototype)
  }
}) {
  return [at, flat];
}