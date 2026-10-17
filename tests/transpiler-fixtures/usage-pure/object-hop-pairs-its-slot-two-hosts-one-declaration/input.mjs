// two claimed hosts in ONE declaration take the sibling-declarator canon each: an object hop beside
// an array wrapper (either order), two array wrappers, each memo standing behind the declarators
// written ahead of its host and the join retaining binding order; a symbol leaf under a hop beside a
// sibling takes the slot memo like the instance leaf of the same slot
function twoHostsOneDeclaration(eff) {
  const { a, w: { at: hostObjAt } } = { a: eff(), w: eff() }, [{ flat: hostArrFlat }, hz] = [eff(), 1];
  const [{ flat: firstFlat }, fz] = [eff(), 1], mid = 3, [{ at: secondAt }, sz] = [eff(), 2], tail = 4;
  const { b, w: { [Symbol.iterator]: symInSlot } } = { b: eff(), w: eff() };
  const { w: { [Symbol.iterator]: symHoist }, c } = { w: eff(), c: 1 }, symQ = 2;
  return [a, hostObjAt, hostArrFlat, hz, firstFlat, fz, mid, secondAt, sz, tail, b, symInSlot, symHoist, c, symQ];
}
export default [twoHostsOneDeclaration(() => [[1], 2])];
