import _Array$from from "@core-js/pure/actual/array/from";
// The header sink retains the sequence prefix before reading the getter-backed container.
const holder = {
  get box() {
    effect('get');
    return {
      A: Array
    };
  }
};
for (const from = (effect('prefix'), holder.box, _Array$from);;) {
  use(from([7]));
  break;
}