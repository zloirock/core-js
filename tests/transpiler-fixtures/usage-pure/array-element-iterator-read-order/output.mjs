import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
// Each iterator occurrence reads independently, in source order with native and instance siblings.
export function read(receiver) {
  const [_ref] = [receiver];
  const first = _getIteratorMethod(_ref);
  const {
    other
  } = _ref;
  const at = _at(_ref);
  const second = _getIteratorMethod(_ref);
  return [first, other, at, second];
}