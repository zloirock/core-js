import _at from "@core-js/pure/actual/instance/at";
// `_ref2` referenced in source (user-owned, inside the catch body). Plugin must pick
// a non-colliding name for its own catch-ref. Plugin's prune+rename should not touch
// the user's `_ref2` at its binding site.
const _ref2 = "user-owned";
try {} catch (_ref) {
  let at = _at(_ref);
  console.log(_ref2);
  at(0);
}