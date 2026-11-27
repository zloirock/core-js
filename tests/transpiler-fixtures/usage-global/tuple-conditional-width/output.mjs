import "core-js/modules/es.array.at";
type Row = [string] extends [string, number?] ? number[] : string;
export function first(value: Row) {
  return value.at(0);
}