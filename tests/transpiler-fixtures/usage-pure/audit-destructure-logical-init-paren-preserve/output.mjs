import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
const from = _Array$from;
// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
const {
  from: _unused,
  ...rest
} = _globalThis.Array ?? (_Set || _Map);
const groupBy = _Map$groupBy;
const {
  groupBy: _unused2,
  ...others
} = _Map ?? (_WeakMap || _Set);
export { from, rest, groupBy, others };