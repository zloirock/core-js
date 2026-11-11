import _Array$from from "@core-js/pure/actual/array/from";
// A bodyless assignment still evaluates the getter before binding the static.
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
  holder.box;
  from = _Array$from;
}
use(from);