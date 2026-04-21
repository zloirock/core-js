// User has `_ref` at module scope. Plugin-owned scope.push later allocates `_ref2`, `_ref3`.
// After prune+rename, plugin-owned refs should not collide with the user's `_ref` binding,
// and nested `_ref3` (user-owned) should not be renamed because ownedBindings excludes it.
const _ref = 42;
function f() {
  const _ref3 = "user-nested";
  try {} catch ({ at }) { at(0); }
  try {} catch ({ flat }) { flat(); }
  try {} catch ({ includes }) { includes("x"); }
  return _ref3;
}
