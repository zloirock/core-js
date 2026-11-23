import _Array$from from "@core-js/pure/actual/array/from";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// The known return shape admits extraction; the getter can still throw before the binding.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
  if (x === "box") throw new RangeError();
}
const holder = {
  get box() {
    eff("box");
    return {
      A: Array
    };
  }
};
try {
  eff("p");
  holder.box;
  const from = _Array$from;
  r = typeof from;
} catch (error) {
  r = _nameMaybeFunction(error);
}