import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
// A default on a leaf pure serves as its ponyfill never runs, and the rewrite drops it before a later
// read is asked about: a write in it reaches none - not one after the declaration, not one after the
// function the default sits in.
let list = [1, 2];
const from = _Array$from;
export const last = _atMaybeArray(list).call(list, -1);
let rows = [3, 4];
(() => {
  const of = _Array$of;
  return of;
})();
export const found = _includesMaybeArray(rows).call(rows, 3);
export const made = from([5]);