import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Native siblings stay between distinct claimed property reads.
// Repeated keys keep separate getter results.
export function read(receiver) {
  const [,] = [receiver];
  const first = _at(receiver);
  const {
    other
  } = receiver;
  const second = _at(receiver);
  const includes = _includes(receiver);
  return [first, other, second, includes];
}