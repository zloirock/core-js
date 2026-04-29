// `_ref2` referenced in source (user-owned, inside the catch body). Plugin must pick
// a non-colliding name for its own catch-ref. Plugin's prune+rename should not touch
// the user's `_ref2` at its binding site.
const _ref2 = "user-owned";
try {} catch ({ at }) {
  console.log(_ref2);
  at(0);
}
