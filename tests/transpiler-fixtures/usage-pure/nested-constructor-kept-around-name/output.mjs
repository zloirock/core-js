import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
// Excluded statics keep both sides of the served function-name read.
// Capturing the receiver must not batch its residual keys ahead of the claim.
const {
    Array: _ref
  } = _globalThis,
  {
    from
  } = _ref,
  name = _nameMaybeFunction(_ref),
  {
    of
  } = _ref;
use(from, name, of);
export {};