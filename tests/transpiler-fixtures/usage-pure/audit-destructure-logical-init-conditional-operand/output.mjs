import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const {
  from,
  ...rest
} = _globalThis.Array || (cond ? _Set : _Map);
const {
  of,
  ...others
} = _globalThis.Array || (readOnlyFlag, _WeakSet);
export { from, rest, of, others };