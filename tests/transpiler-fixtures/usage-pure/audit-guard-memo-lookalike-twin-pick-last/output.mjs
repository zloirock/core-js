import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _at from "@core-js/pure/actual/instance/at";
// A memoized guard root whose source text REPEATS inside its own guarded branch: the second occurrence is a look-alike twin, not
// the root, and only its source position tells them apart.
export function pickLast(fn, o) {
  var _ref, _ref2;
  return null == (_ref = o.items) ? void 0 : (_at(_ref) || 0).call(_ref, _findLastIndexMaybeArray(_ref2 = o.items).call(_ref2, fn));
}