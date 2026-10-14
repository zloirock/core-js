// A rest parameter default over a realm read behind an effectful hop key, `||` a fallback: excluding the
// left's constructor (`Map`) only stops injecting it - the data subset carries it, so usage-global counts
// the left present and the right (`Set`) never runs, loading nothing, while `groupBy` keeps its own module.
let eff = 0;
function k({ groupBy, ...rest } = globalThis[(eff++, 'self')].Map || Set) { return [groupBy, rest]; }
k();
