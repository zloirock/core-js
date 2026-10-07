// A fully-consumed static destructure whose receiver buries an effect in a proxy-hop KEY inside a LOGICAL
// operand: where its left decides nothing (`.Map`, its constructor entry excluded, while `groupBy` keeps its
// own) the residual keeps the selection whole - the key effect exactly once, the hop collapsed onto the pure
// root (`(r++, _self).Map`), the right polyfilled.
let r = 0;
const { groupBy } = (globalThis[(r++, 'self')].Map) || Set;
groupBy(list, key);
