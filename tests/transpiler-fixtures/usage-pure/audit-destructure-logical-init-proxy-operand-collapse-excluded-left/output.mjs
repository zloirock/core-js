import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// destructure off a `||` init whose left operand is a proxy-global member chain and whose retained sibling
// (`other`) keeps the init in the output: a left whose constructor entry is excluded (`globalThis.Map`, while
// `groupBy` keeps its own) still decides - the data subset carries `Map` - so the right never runs and leaves
// with its import, and the sibling reads the left through its substituted root (`_globalThis.Map`).
const groupBy = _Map$groupBy;
const {
  other: kept
} = _globalThis.Map;
groupBy(list, key);
console.log(kept);