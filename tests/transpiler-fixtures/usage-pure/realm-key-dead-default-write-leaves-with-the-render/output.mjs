import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _DOMException from "@core-js/pure/actual/dom-exception/constructor";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
var _ref;
// A write in a realm key's dead default reaches no later read, whichever render drops the default: a level
// anchored on the constructor's ponyfill, a level a rest beside it splits off. A consumed assignment's value keeps
// reading the realm itself, where pure installs nothing: its default stays, and so does the write in it, live
// on an engine lacking the global - in usage-global the build fills that slot, and the write dies there too.
let a = 'ab',
  b = 'cd',
  c = 'ef',
  concat;
const {
  custom
} = _WeakMap;
const allSettled = _Promise$allSettled;
const {
  Promise: _unused,
  ...rest
} = _globalThis;
use((_ref = {
  Iterator: {} = (c = [3], _DOMException)
} = _globalThis, concat = _Iterator$concat, _ref));
export const reads = [a.flat(), b.findLast(Boolean), _toReversedMaybeArray(c).call(c)];
export { custom, allSettled, rest, concat };