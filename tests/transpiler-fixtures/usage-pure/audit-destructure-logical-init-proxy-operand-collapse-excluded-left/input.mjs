// destructure off a `||` init whose left operand is a proxy-global member chain and whose retained sibling
// (`other`) keeps the init in the output: a left whose constructor entry is excluded (`globalThis.Map`, while
// `groupBy` keeps its own) still decides - the data subset carries `Map` - so the right never runs and leaves
// with its import, and the sibling reads the left through its substituted root (`_globalThis.Map`).
const { groupBy, other: kept } = globalThis.Map || Set;
groupBy(list, key);
console.log(kept);
