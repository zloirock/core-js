import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Positional assignments retain iteration and complete each target write in source order.
export function read(rows) {
  var _ref, _ref2, _ref3;
  let value, tail;
  [[_ref],, [_ref2], ..._ref3] = rows;
  value = _at(_ref);
  value = _includes(_ref2);
  tail = _ref3;
  return [value, tail];
}