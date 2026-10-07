// retained `??` init: the left operand is a proxy-global member chain, the right a bare global. over a left
// the build does not serve (`globalThis.Map`, its constructor entry excluded, while `groupBy` keeps its own)
// each operand is polyfilled in place (`_globalThis.Map ?? _Set`) so neither ReferenceErrors
const { groupBy, other: kept } = globalThis.Map ?? Set;
groupBy(list, key);
console.log(kept);
