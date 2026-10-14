// A proxy-global member chain with a redundant `.self` hop inside a LOGICAL-expression PARAM-DEFAULT receiver
// collapses the hop - `globalThis.self` is undefined off-browser. A left whose namespace entry is excluded
// (`Reflect`, while `getPrototypeOf` keeps its own) still decides - the data subset carries `Reflect` - so the
// pure-constructor right (`globalThis.self.Set`) never runs and leaves with its import.
function g({ getPrototypeOf, ...rest } = globalThis.self.Reflect || globalThis.self.Set) {
  return getPrototypeOf([]);
}
g();
