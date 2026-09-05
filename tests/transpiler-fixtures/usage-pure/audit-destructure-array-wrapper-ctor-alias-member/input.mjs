// an array-wrapped proxy-global ctor alias binds `A` / `M` to the global through the ArrayPattern
// wrapper. members off the alias must resolve like the un-wrapped `{ Array: A } = globalThis` form:
// `A.from` folds to the pure static, and a whole-ctor global's separate static (`M.groupBy`) narrows
// to its own import - the extracted `_Map` does not carry `groupBy`, so an un-narrowed member read
// would regress to `undefined`. the registered-alias hint carries the resolution past the flatten,
// which empties the pattern slot before the member visit
const [{ Array: A }, tail] = [globalThis, 0];
const [{ Map: M }] = [globalThis];
export const r = [A.from([1, 2, 3]), typeof M.groupBy];
export const effects = tail;
