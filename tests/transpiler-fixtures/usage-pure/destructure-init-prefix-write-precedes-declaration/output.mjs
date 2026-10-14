import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A write in the sequence prefix of a destructure initializer runs before the declaration binds
// anything, as a statement standing ahead of it would - which is where the rewrite moves it. A
// later read of the written binding takes the written value's type, after the declaration or in a
// later declarator of the same one.
let text = [1, 2];
text = 'ab';
const from = _Array$from;
export const last = _atMaybeString(text).call(text, -1);
let list = 'cd';
if (ready) {
  list = [3, 4];
  const of = _Array$of;
  const found = _includesMaybeArray(list).call(list, 3);
  use(of, found);
}
export const made = from([5]);