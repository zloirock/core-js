import "core-js/modules/es.array.at";
type Item = { [K in 'item-01' as K extends `item-${number}` ? 'selected' : 'other']: number[] };
export function first(row: Item) {
  return row.selected.at(0);
}