import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// One positional plan retains native iteration and emits all selected reads in source order.
export function nested(rows) {
  const [[_ref],, [_ref2], ..._ref3] = rows;
  const at = _at(_ref);
  const includes = _includes(_ref2);
  const tail = _ref3;
  return [at, includes, tail];
}
export function header(rows) {
  for (const [_ref4, _ref5] = rows, at = _at(_ref4), includes = _includes(_ref5);;) return [at, includes];
}
export function bodyless(rows) {
  if (rows) var [_ref6, _ref7] = rows,
    at = _at(_ref6),
    includes = _includes(_ref7);
  return [at, includes];
}