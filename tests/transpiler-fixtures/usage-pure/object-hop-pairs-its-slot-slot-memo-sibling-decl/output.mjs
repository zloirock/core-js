import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// A sibling declarator and the captured array positions keep their source order;
// two leaves off one slot share its value without reevaluating its initializer.
function slotMemoSiblingDecl(eff) {
  const _ref = {
    w: eff(),
    z: 1
  };
  const sibHoist = _at(_ref.w);
  const {
    z
  } = _ref;
  const sibQ = 2;
  const _ref2 = {
    a: eff(),
    w: eff()
  };
  const {
    a
  } = _ref2;
  const sibInSlot = _at(_ref2.w);
  const sibQ2 = 3;
  const _ref3 = {
      b: eff(),
      w: eff()
    },
    {
      b
    } = _ref3,
    {
      w: _ref4
    } = _ref3,
    twinAt = _at(_ref4),
    twinFlat = _flatMaybeArray(_ref4);
  return [sibHoist, z, sibQ, sibInSlot, a, sibQ2, twinAt, twinFlat, b];
}
export default [slotMemoSiblingDecl(() => [1, 2])];