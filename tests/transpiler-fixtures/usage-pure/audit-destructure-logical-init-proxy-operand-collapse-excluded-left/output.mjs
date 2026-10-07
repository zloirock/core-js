import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
const groupBy = _Map$groupBy;
// destructure off a `||` init whose left operand is a proxy-global member chain and whose retained sibling
// (`other`) keeps the init in the output: over a left the build does not serve (`globalThis.Map`, its
// constructor entry excluded, while `groupBy` keeps its own) each operand is polyfilled in place so neither
// side ReferenceErrors on old engines - the chain keeps its substituted root, the bare global becomes its pure
// import.
const {
  other: kept
} = _globalThis.Map || _Set;
groupBy(list, key);
console.log(kept);