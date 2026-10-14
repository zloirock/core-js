// A rest parameter default selecting between two realm reads through a redundant `.self` hop: excluding the
// left's constructor (`Map`) only stops injecting it - the data subset carries it, so usage-global counts the
// left present and the right (`globalThis.self.Set`) never runs, loading nothing; `groupBy` keeps its module.
function g({ groupBy, ...rest } = globalThis.self.Map || globalThis.self.Set) {
  return groupBy([], x => x);
}
g();
