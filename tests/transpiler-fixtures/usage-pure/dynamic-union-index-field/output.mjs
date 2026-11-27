import _at from "@core-js/pure/actual/instance/at";
type Row = {
  [name: string]: string;
} | {
  left: number[];
  right: number[];
};
export function read(row: Row, key: 'left' | 'right') {
  var _ref;
  return _at(_ref = row[key]).call(_ref, 0);
}