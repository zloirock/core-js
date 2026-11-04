import _at from "@core-js/pure/actual/instance/at";
// The native sibling still reads the hop and coerces its value.
export function read(rows) {
  const [_ref] = rows;
  const _ref2 = _ref.hop;
  const at = _at(_ref2);
  const {
    spare: {}
  } = _ref2;
  return at;
}