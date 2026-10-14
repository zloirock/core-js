import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A write in the sequence prefix of a destructure assignment's value runs before the pattern assigns,
// so a later read takes the written value's type - in a block, where only the statements ahead of the
// read are consulted, and in a later element of a sequence statement.
let text = [1, 2];
let list = 'cd';
let from, of;
if (ready) {
  text = 'ab';
  from = _Array$from;
  use(_atMaybeString(text).call(text, -1));
}
if (ready) {
  list = [3, 4];
  of = _Array$of;
  use(_includesMaybeArray(list).call(list, 3));
}
use(from, of);