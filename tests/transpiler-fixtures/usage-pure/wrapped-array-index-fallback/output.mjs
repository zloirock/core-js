import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
export function read(rows: Readonly<number[][]>) {
  var _ref;
  return _at(_ref = rows[0] ?? 'word').call(_ref, -1);
}
export function contains(rows: string[][] | {
  0: string[];
}) {
  var _ref2;
  const {
    0: item
  } = rows;
  return _includes(_ref2 = item ?? 'word').call(_ref2, 'or');
}