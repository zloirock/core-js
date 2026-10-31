// A sibling declarator and the captured array positions keep their source order;
// two leaves off one slot share its value without reevaluating its initializer.
function slotMemoSiblingDecl(eff) {
  const { w: { at: sibHoist }, z } = { w: eff(), z: 1 }, sibQ = 2;
  const { a, w: { at: sibInSlot } } = { a: eff(), w: eff() }, sibQ2 = 3;
  const { b, w: { at: twinAt, flat: twinFlat } } = { b: eff(), w: eff() };
  return [sibHoist, z, sibQ, sibInSlot, a, sibQ2, twinAt, twinFlat, b];
}
export default [slotMemoSiblingDecl(() => [1, 2])];
