import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A destructure host fills its pattern after its value runs, so a write in a default or a computed
// key of the pattern lands after a write in the value's sequence prefix though the source places it
// first - also where the rewrite lifts that prefix ahead of the declaration. A later read cannot take
// the prefix write's type.
let text = [1, 2];
text = 'ab';
const from = _Array$from;
const {
  other = text = [3]
} = Array;
export const last = _at(text).call(text, -1);
let list = 'cd';
const box = {};
({
  [(list = 'ef', 'key')]: box.key
} = (list = [5], box));
export const found = _includes(list).call(list, 'e');
export const made = [from([4]), other];