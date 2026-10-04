import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
// Each iterator occurrence reads independently, in source order with native and instance siblings.
export function read(receiver) {
  const [,] = [receiver];
  const first = _getIteratorMethod(receiver);
  const {
    other
  } = receiver;
  const at = _at(receiver);
  const second = _getIteratorMethod(receiver);
  return [first, other, at, second];
}