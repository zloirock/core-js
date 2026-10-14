import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// retained `??` init: the left operand is a proxy-global member chain, the right a bare global. a left whose
// constructor entry is excluded (`globalThis.Map`, while `groupBy` keeps its own) still decides - the data subset
// carries `Map` - so the right never runs and leaves with its import, the sibling reading `_globalThis.Map`
const groupBy = _Map$groupBy;
const {
  other: kept
} = _globalThis.Map;
groupBy(list, key);
console.log(kept);