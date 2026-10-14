// A left whose constructor entry is excluded (`Map`, while `groupBy` keeps its own) still decides - the data
// subset carries `Map` - so the right, a constructor read through an alias of the realm (`g.self.Set`), never
// runs and leaves with its import, while the left lands on the backed proxy root (`_self.Map`). The left is read
// once for the polyfilled property and the copy of the remaining keys.
const g = globalThis;
const { groupBy, ...others } = globalThis.self.Map || g.self.Set;
groupBy(list, key);
