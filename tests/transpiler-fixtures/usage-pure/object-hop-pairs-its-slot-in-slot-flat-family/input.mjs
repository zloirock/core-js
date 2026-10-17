// Native bindings on either side of a claimed slot retain their order, including array rest.
function inSlotFlatFamily(eff, eff2, eff3) {
  const [fa, { at: flatInSlot }] = [eff(), eff()];
  const [fb, { at: flatRestSlot }, ...flatRest] = [eff(), eff()];
  const [, { at: liftedThenSlot }, fz] = [eff(), eff(), 1];
  const [fx, , { at: boundThenHole }] = [1, eff2(), eff3()];
  const [, { y: { at: liftedHopSlot } }, fz2] = [eff(), { y: eff() }, 1];
  return [fa, flatInSlot, fb, flatRestSlot, flatRest, liftedThenSlot, fz, fx, boundThenHole, liftedHopSlot, fz2];
}
export default [inSlotFlatFamily(() => [1, 2], () => 2, () => [3])];
