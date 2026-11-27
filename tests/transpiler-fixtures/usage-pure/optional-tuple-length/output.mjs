import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Size = (readonly [number, string?])['length'];
type Row = Size extends 1 | 2 ? number[] : string;
export function first(value: Row) {
  return _atMaybeArray(value).call(value, 0);
}