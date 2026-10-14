import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _includes from "@core-js/pure/actual/instance/includes";
// A compound write in the sequence prefix of a destructure init beside another declarator: the
// rewrite splits the declaration and lifts the prefix between the halves. A later read resolves
// the binding through that write where it now stands - the value it adds is unknown, and a
// logical assignment over a truthy array keeps the array.
let list = [1, 2];
const size = 1;
list += tail;
const make = _Array$from;
export const found = _includes(list).call(list, '1');
let rows = [3, 4];
const count = 2;
rows ||= fallback;
const build = _Array$of;
export const second = _atMaybeArray(rows).call(rows, 1);
export const made = [make([5]), build(6), size, count];