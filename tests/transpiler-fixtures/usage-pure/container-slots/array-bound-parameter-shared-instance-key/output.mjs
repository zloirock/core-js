import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A const-bound computed key reads the array-valued parameter default.
// Pure mirrors its typed helper into the default; supplied arguments retain their own properties.
const KEY = 'at';
export function read({
  [KEY]: at
} = {
  [KEY]: _atMaybeArray([1, 2])
}) {
  return at;
}