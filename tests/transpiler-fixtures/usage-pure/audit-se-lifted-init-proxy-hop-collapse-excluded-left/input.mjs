// a lone-prop destructure whose init is lifted only for its side effect - no surviving sibling or rest reads the
// value - must not read an undefined `.self` hop off-browser (Node): a `||` left whose constructor entry is
// excluded (`Map`, while `groupBy` keeps its own) still decides - the data subset carries `Map` - so the lifted
// statement keeps the effect alone (`fourthReads++`), the realm read and the dead right leaving with their imports
let fourthReads = 0;
const { groupBy: mapGroupBy } = (fourthReads++, globalThis.self.Map) || Set;
export { mapGroupBy };
