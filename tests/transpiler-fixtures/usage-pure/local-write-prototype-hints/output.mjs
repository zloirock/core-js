import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Object$create from "@core-js/pure/actual/object/create";
// An installed array prototype contributes an array family even without a scalar type.
export function read(write) {
  let value = ["z"];
  if (write) value = _Object$create(Array.prototype);
  return _atMaybeArray(value).call(value, 0);
}