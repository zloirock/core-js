// ... and a wrapped STATIC beside its sibling declarator joins the same way, exported with its host
// - two of them, one per host; a mixed pair splits by declarator, the static joining its own host
export const [{ Set: exportWrappedSet }, ee] = [globalThis, 2], [{ Map: exportWrappedMap }, ef] = [globalThis, 3];

export default [exportWrappedSet, ee, exportWrappedMap, ef];
