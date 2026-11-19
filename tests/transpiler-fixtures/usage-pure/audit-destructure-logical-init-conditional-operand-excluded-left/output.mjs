import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Other sources keep their rest exclusions and independently claimed statics. A left whose constructor entry is
// excluded (`globalThis.Map`, while `groupBy` keeps its own) still decides - the data subset carries `Map` - so a
// conditional or sequence right never runs and leaves with its imports; the rest reads the raw left once, after
// the claimed static, an excluded constructor having no whole index to take.
const _ref = _globalThis.Map,
  groupBy = _Map$groupBy,
  {
    groupBy: _unused,
    ...props
  } = _ref;
const _ref2 = _globalThis.Map,
  grouped = _Map$groupBy,
  {
    groupBy: _unused2,
    ...more
  } = _ref2;
export { groupBy, props, grouped, more };