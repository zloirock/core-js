import "core-js/modules/es.array.at";
type Row = ['left', 'right'] extends ['right', 'left'] ? string : number[];
export function first(value: Row) {
  return value.at(0);
}