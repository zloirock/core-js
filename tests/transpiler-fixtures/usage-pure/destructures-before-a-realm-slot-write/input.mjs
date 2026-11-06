// Static reads before later realm-slot writes keep their original source-time claims.
// A constructor inside a literal namespace stays native; later writes must not move ahead of those reads.
const ns = { root: globalThis };
const { root: { self: { Map: M } } } = ns;
const { groupBy } = shim || Map;
const { Map: { groupBy: grouped } } = globalThis;
const { Promise: { allSettled }, ...others } = globalThis;
const { WeakMap: { prototype: { has } } } = globalThis;
const { Promise: { prototype: { finally: fin } } } = globalThis;
export { M, groupBy, grouped, allSettled, others, has, fin };
globalThis.Map = MapShim;
globalThis.WeakMap = WeakMapShim;
globalThis.Promise = PromiseShim;
