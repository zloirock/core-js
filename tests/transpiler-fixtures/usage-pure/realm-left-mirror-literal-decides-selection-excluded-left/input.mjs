// A residual-keeping destructure rebuilds a realm-read LEFT as a literal: a left whose constructor entry is
// excluded (`Map`, while `groupBy` keeps its own) still decides its selection alone - the data subset carries
// `Map` - its right dead and its own effects in place, in a declaration and in a for-of head element alike; a
// caller default keeps the plain literal. A left the rebuild leaves possibly undefined, and a rebuilt RIGHT, keep
// the selection.
const { groupBy, deep: { a } } = globalThis.Map || (log(), Fallback);
const { groupBy: grouped, deep: { b } } = (globalThis.Map ?? X) || Y;
let byKey, c;
({ groupBy: byKey, deep: { c } } = (log(), globalThis.Map) ?? Fallback);
const { groupBy: byFlag, deep: { d } } = (flag ? globalThis.Map : globalThis.WeakRef) || Fallback;
const { groupBy: byRight, deep: { e } } = globalThis.WeakRef || Map;
export function pick({ groupBy: picked, deep: { f } } = globalThis.Map || (log(), Fallback)) {
  return [picked, f];
}
for (const { groupBy: perPass, deep: { g } } of [globalThis.Map || (log(), Fallback)]) use(perPass, g);
export { groupBy, a, grouped, b, byKey, c, byFlag, d, byRight, e };
