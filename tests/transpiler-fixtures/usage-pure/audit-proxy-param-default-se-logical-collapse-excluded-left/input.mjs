// Constructor rest uses the full index where a constructor entry exists (`Set`); other sources keep their
// rest exclusions and independently claimed statics. Behind the default's effect
// prefix a logical whose left the build does not serve (`.Reflect`, its namespace entry excluded, while
// `construct` keeps its own) keeps both operands, each polyfilled in place.
function effect() {}
function g({ construct, ...rest } = (effect(), globalThis.self.Reflect || Set)) {
  return construct(Base, []);
}
g();
