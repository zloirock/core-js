import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
// A destructure host fills its pattern after its value, and serving a static off the pattern keeps
// that order though the rewrite moves the parts: the value's prefix lands ahead of what is left of
// the host, a computed key moves into the extraction's value. A read in a key sees the prefix's
// write, and a read after the host sees the key's.
let text = [1, 2],
  head,
  from,
  first;
text = 'ab', from = _Array$from, head = _at(text).call(text, 0), first = _Array$of;
let list;
list = [3];
const entries = _Object$entries;
const make = (list = 'cd', _Object$values);
export const tail = _includes(list).call(list, 'c');
export const made = [from, first, entries, make, head];