import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
const holder = {
  0: _globalThis
};
function slotMemoHoist(eff, holder) {
  const _ref = {
    w: eff(),
    z: 1
  };
  const slotHoist = _at(_ref.w);
  const {
    z
  } = _ref;
  const _ref2 = {
    a: eff(),
    w: eff()
  };
  const {
    a
  } = _ref2;
  const slotInSlot = _at(_ref2.w);
  const {
    w: {
      at: slotRest
    },
    ...slotRestRest
  } = {
    w: eff(),
    z: 2
  };
  const _ref3 = {
    p: {
      w: eff()
    },
    q: 3
  };
  const slotNested = _at(_ref3.p.w);
  const {
    q
  } = _ref3;
  const _ref4 = {
    b: eff(),
    w: holder.p
  };
  const {
    b
  } = _ref4;
  const slotMember = _at(_ref4.w);
  return [slotHoist, z, slotInSlot, a, slotRest, slotRestRest, slotNested, q, slotMember, b];
}
export default [slotMemoHoist(() => [1, 2], {
  p: [3]
})];