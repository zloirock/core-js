// Defined constructor and static ponyfills make these source defaults unreachable at every
// depth: under an object hop, under an array wrapper, and beside a sibling.
function defaultKeepsGuard() {
  const { w: { Map: dfMap = null }, z } = { w: globalThis, z: 1 };
  const { Array: { from: dfFrom = null } } = globalThis;
  const [{ of: dfOf = null }, y] = [Array, 2];
  const { w: { Array: { from: dfDeep = null } } } = { w: globalThis };
  return [dfMap, z, dfFrom, dfOf, y, dfDeep];
}
export default [defaultKeepsGuard()];
