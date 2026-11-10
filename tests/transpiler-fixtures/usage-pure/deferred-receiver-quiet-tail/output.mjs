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
      A: Array
    };
  }
};
eff("p");
holder.box;
const from = _Array$from;
r = typeof from;