import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// A default on a leaf pure serves as its ponyfill never runs: the import is never undefined, and the
// rewrite drops the default. A write in it reaches no read - not one in a function declared above it,
// not one off the member it writes.
let list = [1, 2];
const box = {
  items: [3, 4]
};
export function last() {
  return _atMaybeArray(list).call(list, -1);
}
const from = _Array$from;
export const found = _includesMaybeArray(_ref = box.items).call(_ref, 3);
export const made = from([5]);