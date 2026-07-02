import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// an array-wrapped proxy-global ctor alias binds `A` / `M` to the global through the ArrayPattern
// wrapper. members off the alias must resolve like the un-wrapped `{ Array: A } = globalThis` form:
// `A.from` folds to the pure static, and a whole-ctor global's separate static (`M.groupBy`) narrows
// to its own import - the extracted `_Map` does not carry `groupBy`, so an un-narrowed member read
// would regress to `undefined`. the registered-alias hint carries the resolution past the flatten,
// which empties the pattern slot before the member visit
const [{
  Array: A
}, tail] = [_globalThis, 0];
const M = _Map;
export const r = [_Array$from([1, 2, 3]), typeof _Map$groupBy];
export const effects = tail;