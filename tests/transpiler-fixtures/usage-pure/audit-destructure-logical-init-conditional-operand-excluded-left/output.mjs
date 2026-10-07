import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
const groupBy = _Map$groupBy;
// Other sources keep their rest exclusions and independently claimed statics. A left the build does not
// serve (`globalThis.Map`, its constructor entry excluded, while `groupBy` keeps its own) keeps the
// conditional or sequence operand of its right, each arm polyfilled in place, behind the claimed static.
const {
  groupBy: _unused,
  ...props
} = _globalThis.Map || (cond ? _Set : _WeakMap);
const grouped = _Map$groupBy;
const {
  groupBy: _unused2,
  ...more
} = _globalThis.Map || (readOnlyFlag, _WeakSet);
export { groupBy, props, grouped, more };