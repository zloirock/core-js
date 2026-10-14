import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Other sources keep their rest exclusions and independently claimed statics. A `??` left whose constructor
// entry is excluded (`globalThis.Map`, while `groupBy` keeps its own) still decides - the data subset carries
// `Map` - so its parenthesized `||` right never runs and leaves whole with its import, the rest reading the raw
// left once after the claimed static.
const _ref = _globalThis.Map,
  groupBy = _Map$groupBy,
  {
    groupBy: _unused,
    ...props
  } = _ref;
export { groupBy, props };