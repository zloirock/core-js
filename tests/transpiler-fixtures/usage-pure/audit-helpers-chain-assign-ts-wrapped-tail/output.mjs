import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// peelFallbackReceiver alternates chain-assign peel and paren+TS wrappers until stable.
// here a chain-assign sits inside a TS as-any cast, then another paren wraps the outer
// chain-assign, then a SE-prefix without observable effects, finally the conditional.
// distinct methods (Array.from, Set.union, Map.groupBy) anchor per-branch dispatch
let r;
export const {
  from
} = r = (cond ? Array : _Iterator) as any;
export const {
  union
} = r = (0, cond ? _Set : _WeakSet);
export const {
  groupBy
} = (r = cond ? _Map : _WeakMap) as any;
export { r };