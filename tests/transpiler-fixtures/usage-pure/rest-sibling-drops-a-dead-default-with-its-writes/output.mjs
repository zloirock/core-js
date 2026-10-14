import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
var _unused2;
// A rest sibling keeps the pattern native around a leaf pure serves as its ponyfill, and the leaf's
// default leaves with the rewrite all the same: a write in it reaches no later read, through a
// declaration and through an assignment alike.
let list = [1, 2];
const from = _Array$from,
  {
    from: _unused,
    ...rest
  } = Array;
export const last = _atMaybeArray(list).call(list, -1);
let rows = [3, 4],
  of,
  others;
of = _Array$of, {
  of: _unused2,
  ...others
} = Array;
export const found = _includesMaybeArray(rows).call(rows, 3);
export const made = [from([5]), rest, of(6), others];