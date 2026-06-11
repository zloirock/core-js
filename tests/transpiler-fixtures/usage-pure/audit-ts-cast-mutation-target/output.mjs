import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a mutation target behind stacked wrappers (TS cast, doubled parens) still records: the
// classification peels DOWNWARD from the mutation host, so wrapper depth is unbounded
delete (_Map.groupBy as any);
export const r1 = _Map.groupBy(x, f);
_Iterator.from ||= shim;
export const r2 = _Iterator.from(it);
Object.defineProperty(_Map, 'groupBy', {
  value: dpPatch
});
export const r3 = _Map.groupBy(y, g);