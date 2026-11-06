import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// The first static is bound when the second computed key runs.
// Both constructors are known at their original source slots.
const box = {
  O: Object,
  A: Array
};
let keys, from;
box, {
  [(first(), 'O')]: {}
} = box, keys = _Object$keys, {
  [(next(keys), 'A')]: {}
} = box, from = _Array$from;
export { keys, from };