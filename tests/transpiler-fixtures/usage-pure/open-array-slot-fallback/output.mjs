import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
export function first(rows: number[][]) {
  var _ref;
  return _at(_ref = rows[0] ?? 'fallback').call(_ref, 0);
}
export function read(rows: string[][]) {
  var _ref2;
  const [value] = rows;
  return _includes(_ref2 = value ?? 'fallback').call(_ref2, 'back');
}