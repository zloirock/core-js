import _Array$from from "@core-js/pure/actual/array/from";
// The nested static consumes the pattern, not its initializer getter.
const holder = {
  get box() {
    effect();
    return {
      A: Array
    };
  }
};
for (let from = (holder.box, _Array$from), i = 0; i < 1; i++) use(from);