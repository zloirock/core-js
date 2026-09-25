import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// a member chain past a HOP the file wrote reads the written container, not the literal the hop held,
// and a getter's fresh literal a binding holds is that binding's container: an instance method on
// either dispatches generically in pure and injects every family in usage-global
const box = {
  k: {
    a: [1, 2]
  }
};
box.k = {
  a: 'ab'
};
export const last = _at(_ref = box.k.a).call(_ref, -1);
const source = {
  get fresh() {
    return {
      b: [1, 2]
    };
  }
};
const held = source.fresh;
held.b = 'cd';
export const has = _includes(_ref2 = held.b).call(_ref2, 'd');