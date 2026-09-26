import _at from "@core-js/pure/actual/instance/at";
// Native positional reads remain between the surrounding declarator evaluations.
export function read(rows) {
  const beforeInit = before();
  const [_ref] = rows;
  const {
    first
  } = _ref;
  const _ref2 = _ref.value;
  const {
    other
  } = _ref2;
  const at = _at(_ref2);
  const {
    last
  } = _ref;
  const afterInit = after();
  return [beforeInit, first, other, at, last, afterInit];
}