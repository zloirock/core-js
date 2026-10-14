// Other sources keep their rest exclusions and independently claimed statics. A left whose constructor entry is
// excluded (`globalThis.Map`, while `groupBy` keeps its own) still decides - the data subset carries `Map` - so a
// conditional or sequence right never runs and leaves with its imports; the rest reads the raw left once, after
// the claimed static, an excluded constructor having no whole index to take.
const { groupBy, ...props } = globalThis.Map || (cond ? Set : WeakMap);
const { groupBy: grouped, ...more } = globalThis.Map || (readOnlyFlag, WeakSet);
export { groupBy, props, grouped, more };
