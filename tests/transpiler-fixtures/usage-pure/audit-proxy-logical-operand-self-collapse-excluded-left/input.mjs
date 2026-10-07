// Constructor rest uses the full index where a constructor entry exists (`Set`); other sources keep their
// rest exclusions and independently claimed statics. A `.self` hop in a logical's
// left lands on `_self` where that left decides nothing (`.Map`, its constructor entry excluded, while
// `groupBy` keeps its own) and the selection keeps a live right beside it.
const { groupBy, ...others } = globalThis.self.Map || Set;
groupBy(list, key);
