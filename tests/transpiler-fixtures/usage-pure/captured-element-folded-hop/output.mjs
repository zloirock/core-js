import _at from "@core-js/pure/actual/instance/at";
// A bound key below the captured element names its nested receiver.
const Y = 'y';
export function read(source) {
  const [_ref] = source;
  const at = _at(_ref.y);
  const {
    length
  } = _ref;
  return [at, length];
}