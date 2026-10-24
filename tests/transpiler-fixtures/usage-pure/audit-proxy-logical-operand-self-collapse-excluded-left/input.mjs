// Constructor rest uses the full index where a constructor entry exists; other sources keep their rest exclusions
// and independently claimed statics. A `.self` hop in a logical's left lands on `_self`, and a left whose
// constructor entry is excluded (`.Map`, while `groupBy` keeps its own) still decides - the data subset carries
// `Map` - so the right never runs and leaves with its import, the rest reading the raw left once.
const { groupBy, ...others } = globalThis.self.Map || Set;
groupBy(list, key);
