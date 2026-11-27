import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
type Table = {
  [index: number]: number[];
  [name: string]: number[] | string;
};
export function read(table: Table) {
  var _ref, _ref2;
  return [_at(_ref = table['01']).call(_ref, 0), _includesMaybeArray(_ref2 = table['1']).call(_ref2, 0)];
}