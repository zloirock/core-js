// A proxy-global member chain with a redundant `.self` hop inside a LOGICAL-expression PARAM-DEFAULT receiver
// collapses the hop - `globalThis.self` is undefined off-browser. A left whose constructor entry is excluded
// (`Map`, while `groupBy` keeps its own) still decides - the data subset carries `Map` - so the pure-constructor
// right (`globalThis.self.Set`) never runs and leaves with its import, and the static extracts into the body.
function g({ groupBy, ...rest } = globalThis.self.Map || globalThis.self.Set) {
  return groupBy([], x => x);
}
g();
