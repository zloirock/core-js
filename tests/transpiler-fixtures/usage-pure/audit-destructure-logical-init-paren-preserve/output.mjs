import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const {
  from,
  ...rest
} = _globalThis.Array ?? (_Set || _Map);
const {
  groupBy,
  ...others
} = _Map ?? (_WeakMap || _Set);
export { from, rest, groupBy, others };