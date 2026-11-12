import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A yield inside an optional constructor-producing call must remain lowerable.
export function* read(arr) {
  return new (_flatMaybeArray(arr)?.call(arr, yield 0))(7);
}