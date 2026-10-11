// a destructure that runs before every write of a global's slot sees the slot this build serves, through
// whichever channel renders it: a nested pattern under a realm hop, a selection with the global as an arm,
// a static under a constructor key off the realm, a rest beside one and a prototype pattern under one
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
