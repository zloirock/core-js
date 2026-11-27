import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Item = { [K in 'item-01' as K extends `item-${number}` ? 'selected' : 'other']: number[] };
export function first(row: Item) {
  var _ref;
  return _atMaybeArray(_ref = row.selected).call(_ref, 0);
}