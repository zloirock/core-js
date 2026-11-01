import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// A default under a served realm key is dead even when the assignment's result is used.
// Its writes must leave the type facts together with the default; the result stays the realm.
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
use((concat = _Iterator$concat, _globalThis));
export const reads = [a.flat(), b.findLast(Boolean), c.toReversed()];
export { custom, allSettled, rest, concat };