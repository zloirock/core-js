// A fully-consumed static destructure whose receiver buries an effect in a proxy-hop KEY inside a LOGICAL
// operand: a left whose constructor entry is excluded (`.Map`, while `groupBy` keeps its own) still decides - the
// data subset carries `Map` - so the right never runs and leaves with its import, the consumed left's read leaves
// too, and only the key effect stays, exactly once (`r++`).
let r = 0;
const { groupBy } = (globalThis[(r++, 'self')].Map) || Set;
groupBy(list, key);
