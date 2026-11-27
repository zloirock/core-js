import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Row = ['left', 'right'] extends ['right', 'left'] ? string : number[];
export function first(value: Row) {
  return _atMaybeArray(value).call(value, 0);
}