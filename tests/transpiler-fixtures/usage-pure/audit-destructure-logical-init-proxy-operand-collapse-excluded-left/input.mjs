// destructure off a `||` init whose left operand is a proxy-global member chain and whose retained sibling
// (`other`) keeps the init in the output: over a left the build does not serve (`globalThis.Map`, its
// constructor entry excluded, while `groupBy` keeps its own) each operand is polyfilled in place so neither
// side ReferenceErrors on old engines - the chain keeps its substituted root, the bare global becomes its pure
// import.
const { groupBy, other: kept } = globalThis.Map || Set;
groupBy(list, key);
console.log(kept);
