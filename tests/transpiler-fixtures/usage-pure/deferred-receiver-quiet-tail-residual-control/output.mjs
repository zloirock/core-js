import _Array$from from "@core-js/pure/actual/array/from";
// A consumed initializer keeps the getter after its prefix, exactly once.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
const holder = {
  get box() {
    eff("box");
    return {
      A: Array,
      other: 3
    };
  }
};
const _ref = (eff("p"), holder.box),
  {
    A: {}
  } = _ref,
  from = _Array$from,
  {
    other
  } = _ref;
r = [typeof from, other];