import _Array$from from "@core-js/pure/actual/array/from";
// A discarded initializer stays between its preceding and following declarators.
const holder = {
  get box() {
    effect();
    return {
      A: Array
    };
  }
};
const before = effect();
holder.box;
const from = _Array$from;
const after = effect();
use(before, from, after);