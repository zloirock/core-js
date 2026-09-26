import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Native siblings stay between distinct claimed property reads.
// Repeated keys keep separate getter results.
export function read(receiver) {
  const [_ref] = [receiver];
  const first = _at(_ref);
  const {
    other
  } = _ref;
  const second = _at(_ref);
  const includes = _includes(_ref);
  return [first, other, second, includes];
}