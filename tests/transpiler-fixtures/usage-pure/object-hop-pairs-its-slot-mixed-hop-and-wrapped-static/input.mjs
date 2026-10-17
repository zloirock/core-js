// An object hop and an array wrapper select constructors in one declaration,
// preserving the sibling bindings and their order.
function mixedHopAndWrappedStatic() {
  const { w: { Map: mixedMap }, z: mz } = { w: globalThis, z: 1 }, [{ Set: mixedSet }, my] = [globalThis, 2];
  return [mixedMap, mz, mixedSet, my];
}
export default [mixedHopAndWrappedStatic()];
