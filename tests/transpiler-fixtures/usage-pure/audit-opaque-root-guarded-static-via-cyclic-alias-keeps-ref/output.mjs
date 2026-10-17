import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// NEGATIVE: mutually-recursive wrappers never prove (the cycle guard stops the inline walk) -
// the chain keeps the raw guarded read off the ref
const cyc1 = () => cyc2();
const cyc2 = () => cyc1();
export const viaCyclicAliasKeepsRef = null == (_ref = cyc1()?.window?.self) ? void 0 : _at(_ref2 = _ref.Array.of(27)).call(_ref2, 0);