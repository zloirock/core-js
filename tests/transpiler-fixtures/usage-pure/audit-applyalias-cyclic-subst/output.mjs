import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
var _ref, _ref2;
// generic alias with self-referential default: `Self<T = T[]>`. when resolved without
// concrete arg, default `T[]` references T which substitutes back to default - cycle.
// `applyAliasSubstDeep`'s `visited` Set tracks param names being expanded; second
// visit to T short-circuits to bare reference instead of recursing forever. depth bound
// catches it eventually but allocates O(MAX_DEPTH) frames of CPU; visited cuts it short
type Self<T = T[]> = {
  items: T;
};
declare const r: Self;
_atMaybeArray(_ref = r.items).call(_ref, 0);
_findLastMaybeArray(_ref2 = r.items).call(_ref2, p => p);