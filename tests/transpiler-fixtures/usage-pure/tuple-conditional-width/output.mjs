import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Row = [string] extends [string, number?] ? number[] : string;
export function first(value: Row) {
  return _atMaybeArray(value).call(value, 0);
}