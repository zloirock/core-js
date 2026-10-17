import _at from "@core-js/pure/actual/instance/at";
// Native bindings on either side of a claimed slot retain their order, including array rest.
function inSlotFlatFamily(eff, eff2, eff3) {
  const [_ref, _ref2] = [eff(), eff()];
  const fa = _ref;
  const flatInSlot = _at(_ref2);
  const [_ref3, _ref4, ..._ref5] = [eff(), eff()];
  const fb = _ref3;
  const flatRestSlot = _at(_ref4);
  const flatRest = _ref5;
  eff();
  const _ref6 = eff();
  const liftedThenSlot = _at(_ref6);
  const [, {}, fz] = [, _ref6, 1];
  const [_ref7,, _ref8] = [1, eff2(), eff3()];
  const fx = _ref7;
  const boundThenHole = _at(_ref8);
  const [, _ref9, _ref10] = [eff(), {
    y: eff()
  }, 1];
  const liftedHopSlot = _at(_ref9.y);
  const fz2 = _ref10;
  return [fa, flatInSlot, fb, flatRestSlot, flatRest, liftedThenSlot, fz, fx, boundThenHole, liftedHopSlot, fz2];
}
export default [inSlotFlatFamily(() => [1, 2], () => 2, () => [3])];