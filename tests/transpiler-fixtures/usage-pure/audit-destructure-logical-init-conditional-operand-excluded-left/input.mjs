// Other sources keep their rest exclusions and independently claimed statics. A left the build does not
// serve (`globalThis.Map`, its constructor entry excluded, while `groupBy` keeps its own) keeps the
// conditional or sequence operand of its right, each arm polyfilled in place, behind the claimed static.
const { groupBy, ...props } = globalThis.Map || (cond ? Set : WeakMap);
const { groupBy: grouped, ...more } = globalThis.Map || (readOnlyFlag, WeakSet);
export { groupBy, props, grouped, more };
