import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// An extracted method named like a global constructor remains the local method.
export function read(row) {
  const Map = _at(row);
  const flat = _flatMaybeArray(row);
  return [Map.call(row, -1), typeof flat];
}