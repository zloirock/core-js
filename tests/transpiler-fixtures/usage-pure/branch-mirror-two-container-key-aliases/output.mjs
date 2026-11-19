import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Two computed constructor slots keep their source order and their independent statics.
const src = {
  O: Object,
  A: Array
};
let gate = 1;
let se = 0;
let keys, from, dotted;
src, {
  [(se += 1, 'O')]: {}
} = src, dotted = _Object$keys, {
  [(se += 1, 'A')]: {}
} = src, from = _Array$from;
export { keys, from, dotted, se };