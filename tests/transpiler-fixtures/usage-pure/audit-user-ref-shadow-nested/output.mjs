import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
// User has `_ref` at module scope. Plugin-owned scope.push later allocates `_ref2`, `_ref3`.
// After prune+rename, plugin-owned refs should not collide with the user's `_ref` binding,
// and nested `_ref3` (user-owned) should not be renamed because ownedBindings excludes it.
const _ref = 42;
function f() {
  const _ref3 = "user-nested";
  try {} catch (_ref2) {
    let at = _at(_ref2);
    at(0);
  }
  try {} catch (_ref4) {
    let flat = _flatMaybeArray(_ref4);
    flat();
  }
  try {} catch (_ref5) {
    let includes = _includes(_ref5);
    includes("x");
  }
  return _ref3;
}