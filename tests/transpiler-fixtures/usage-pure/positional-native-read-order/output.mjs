import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Native properties retain their source position between independent positional reads.
export function read(rows) {
  const [_ref] = rows;
  const first = _at(_ref);
  const {
    other
  } = _ref;
  const second = _at(_ref);
  const includes = _includes(_ref);
  return [first, other, second, includes];
}
export function nested(rows) {
  const [_ref2] = rows;
  const _ref3 = _ref2.y;
  const {
    other
  } = _ref3;
  const at = _at(_ref3);
  return [other, at];
}