import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set/constructor";
// A default on a static the build serves still runs where its slot may read `undefined`: off a name a
// write may point elsewhere, off a selection whose other arm lacks the static, over a slot the file
// writes, on a line the user opted out of. A write in it reaches a later read, which takes the helpers
// that write brings.
let a = [1],
  b = [2],
  c = 'ef',
  d = 'gh';
let R = Array;
if (flag) R = _Set;
const {
  from = (a = 'ab', 0)
} = R;
const {
  of = (b = 'cd', 0)
} = flag ? {
  of: _Array$of
} : Math;
_Promise.allSettled = shim;
const {
  allSettled = (c = [3], 0)
} = _Promise;
// core-js-disable-next-line
const {
  entries = (d = [4], 0)
} = Object;
export const reads = [_at(a).call(a, 0), _includes(b).call(b, 1), _flatMaybeArray(c).call(c), _toReversedMaybeArray(d).call(d)];
export { from, of, allSettled, entries };