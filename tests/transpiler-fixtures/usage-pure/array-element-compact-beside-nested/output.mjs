import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A compact extraction preserves a neighbouring nested pattern until its own extraction finishes.
export function read(source) {
  const [_ref] = [source];
  const flat = _flatMaybeArray(_ref.value);
  const {
    keep
  } = _ref;
  const at = _atMaybeArray([1, 2]);
  return [flat, keep, at];
}