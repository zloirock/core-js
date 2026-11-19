// Constructor rest uses the full index where a constructor entry exists; other sources keep their rest exclusions
// and independently claimed statics. Behind the default's effect prefix a logical whose left's constructor entry
// is excluded (`.Map`, while `groupBy` keeps its own) still decides - the data subset carries `Map` - so the right
// never runs and leaves with its import, the prefix and the raw left staying in place.
function effect() {}
function g({ groupBy, ...rest } = (effect(), globalThis.self.Map || Set)) {
  return groupBy([], x => x);
}
g();
