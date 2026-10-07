import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
const groupBy = _Map$groupBy;
// retained `??` init: the left operand is a proxy-global member chain, the right a bare global. over a left
// the build does not serve (`globalThis.Map`, its constructor entry excluded, while `groupBy` keeps its own)
// each operand is polyfilled in place (`_globalThis.Map ?? _Set`) so neither ReferenceErrors
const {
  other: kept
} = _globalThis.Map ?? _Set;
groupBy(list, key);
console.log(kept);