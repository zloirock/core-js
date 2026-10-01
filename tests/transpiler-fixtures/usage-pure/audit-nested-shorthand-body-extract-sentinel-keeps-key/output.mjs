import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Capture the literal receiver once, select the pure at method from its m value, then evaluate the
// computed sibling key. Both source bindings and their property order are preserved.
function key() {
  return 'k';
}
const _ref2 = {
    m: [1],
    k: 2
  },
  {
    m: _ref
  } = _ref2,
  at = _atMaybeArray(_ref),
  {
    [key()]: picked
  } = _ref2;
at();
export const out = picked;