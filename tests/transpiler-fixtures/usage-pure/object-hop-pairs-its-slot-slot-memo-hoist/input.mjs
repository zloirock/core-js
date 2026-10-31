const holder = { 0: globalThis };
function slotMemoHoist(eff, holder) {
  const { w: { at: slotHoist }, z } = { w: eff(), z: 1 };
  const { a, w: { at: slotInSlot } } = { a: eff(), w: eff() };
  const { w: { at: slotRest }, ...slotRestRest } = { w: eff(), z: 2 };
  const { p: { w: { at: slotNested } }, q } = { p: { w: eff() }, q: 3 };
  const { b, w: { at: slotMember } } = { b: eff(), w: holder.p };
  return [slotHoist, z, slotInSlot, a, slotRest, slotRestRest, slotNested, q, slotMember, b];
}
export default [slotMemoHoist(() => [1, 2], { p: [3] })];
