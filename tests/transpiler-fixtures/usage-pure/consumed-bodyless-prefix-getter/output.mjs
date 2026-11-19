import _Array$from from "@core-js/pure/actual/array/from";
// Lifting the source prefix does not pay for the getter after it.
const holder = {
  get box() {
    effect();
    return {
      A: Array
    };
  }
};
let from;
if (condition) {
  prefix();
  holder.box;
  from = _Array$from;
}
use(from);