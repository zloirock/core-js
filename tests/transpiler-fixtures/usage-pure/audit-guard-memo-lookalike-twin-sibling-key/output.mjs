import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _at from "@core-js/pure/actual/instance/at";
// BOUNDARY: the root and the argument share a PREFIX but not the whole root text - the
// structural-boundary gate already rejects it, and the position gate agrees
export function siblingKey(fn, o) {
  var _ref, _ref2;
  return null == (_ref = o.items) ? void 0 : (_at(_ref) || 0).call(_ref, _findLastIndexMaybeArray(_ref2 = o.itemsExtra).call(_ref2, fn));
}