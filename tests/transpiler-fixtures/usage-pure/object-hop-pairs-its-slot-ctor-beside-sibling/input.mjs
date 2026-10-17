// a ctor under a literal hop whose level keeps a SIBLING prop consumes on both legs, like a static
// under the same hop: the leaf leaves with its emptied hop, the sibling keeps the residual
function ctorBesideSibling(eff) {
  const { w: { Map: sibMap }, z } = { w: globalThis, z: 1 };
  const { a, w: { Set: sibSet, WeakMap: sibWeakMap } } = { a: eff(), w: globalThis };
  const { w: { Map: sibMultiMap }, y } = { w: self, y: 2 }, sibQ = 3;
  return [sibMap, z, sibSet, sibWeakMap, a, sibMultiMap, y, sibQ];
}
export default [ctorBesideSibling(() => 4)];
