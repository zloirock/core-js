// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
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
