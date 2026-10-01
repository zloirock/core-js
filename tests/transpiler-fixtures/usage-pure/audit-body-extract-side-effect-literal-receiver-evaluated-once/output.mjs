import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// An array receiver containing a call is evaluated once before either binding.
// The first instance read precedes the computed sibling key, and both use the same receiver.
// An effect inside a literal is still an effect that must not be duplicated.
function key() {
  return 'k';
}
function fn() {
  return 1;
}
const _ref = [fn()];
const at = _atMaybeArray(_ref);
const {
  [key()]: picked
} = _ref;
at();
export const out = picked;