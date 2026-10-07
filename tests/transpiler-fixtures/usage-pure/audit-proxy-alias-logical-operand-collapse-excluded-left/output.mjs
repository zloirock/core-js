import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set";
// A const alias of the realm object follows the ordinary proxy-hop collapse inside a logical receiver whose
// left the build does not serve (`g.self.Map`, its constructor entry excluded, while `groupBy` keeps its own):
// the live operand reads `g.Map`, so a host without native self does not fail before the fallback. The
// selection is evaluated once for the polyfilled extraction and the remaining-key copy.
const g = _globalThis;
const groupBy = _Map$groupBy;
const {
  groupBy: _unused,
  ...others
} = g.Map || _Set;
groupBy(list, key);