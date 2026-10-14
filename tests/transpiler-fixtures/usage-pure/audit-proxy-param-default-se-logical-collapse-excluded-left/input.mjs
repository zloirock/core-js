// Constructor rest uses the full index where a constructor entry exists; other sources keep their rest exclusions
// and independently claimed statics. Behind the default's effect prefix a logical whose left's namespace entry is
// excluded (`.Reflect`, while `construct` keeps its own) still decides - the data subset carries `Reflect` - so
// the right never runs and leaves with its import, the prefix and the raw left staying in place.
function effect() {}
function g({ construct, ...rest } = (effect(), globalThis.self.Reflect || Set)) {
  return construct(Base, []);
}
g();
