import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a receiver that is an array literal CONTAINING a side effect (`[fn()]`) must be evaluated EXACTLY
// once - the body-extract must not re-emit it (which would call `fn()` twice). the side-effecting
// literal is memoized into a single `_ref` that both the `_at(_ref)` extract and the residual
// destructure reference; a pure literal (no inner side effect) may instead be re-emitted safely.
// the side-effect check must recurse into the literal's elements, not just inspect the literal node
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