// Behind the default's effect prefix, a rest parameter default `||` over a realm read whose constructor the
// build excludes (`Map`): the data subset carries it, so usage-global counts the left present and the right
// (`Set`) never runs, loading nothing, while `groupBy` keeps its own module.
function effect() {}
function g({ groupBy, ...rest } = (effect(), globalThis.self.Map || Set)) {
  return groupBy([], x => x);
}
g();
