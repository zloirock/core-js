import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
const groupBy = _Map$groupBy;
// Constructor rest uses the full index where a constructor entry exists (`Set`); other sources keep their
// rest exclusions and independently claimed statics. A `.self` hop in a logical's
// left lands on `_self` where that left decides nothing (`.Map`, its constructor entry excluded, while
// `groupBy` keeps its own) and the selection keeps a live right beside it.
const {
  groupBy: _unused,
  ...others
} = _self.Map || _Set;
groupBy(list, key);