// A const alias of the realm object follows the ordinary proxy-hop collapse inside a logical receiver whose left's
// constructor entry is excluded (`g.self.Map`, while `groupBy` keeps its own): the left still decides - the data
// subset carries `Map` - so the right leaves with its import, and the live left reads `g.Map`, so a host without
// native self does not fail. The left is read once for the polyfilled extraction and the remaining-key copy.
const g = globalThis;
const { groupBy, ...others } = g.self.Map || Set;
groupBy(list, key);
