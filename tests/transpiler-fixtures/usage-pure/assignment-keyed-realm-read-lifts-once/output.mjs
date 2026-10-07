import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// A fully consumed destructuring ASSIGNMENT whose init is a realm read under an effectful KEY keeps that
// read, once, as its own statement ahead of the extraction: a constructor with no pure constructor entry
// (`Array`, `Object`) keeps the realm root and spells the read off it, one with an entry (`Map`) swaps
// whole. The key's effect runs exactly as often as the source runs it.
let c = 0;
let of, fromEntries, groupBy;
_globalThis[c++, 'Array'];
of = _Array$of;
_globalThis[c++, 'Object'];
fromEntries = _Object$fromEntries;
c++, _Map;
groupBy = _Map$groupBy;
export { of, fromEntries, groupBy, c };