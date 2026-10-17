// IIFE-rooted proxy chain with an intermediate `.self` hop before the well-known symbol
// (`(IIFE)().self.Symbol.iterator`). every hop of the subsumed chain must be marked, not just the
// constructor member - an unmarked `.self` hop queues its own rewrite overlapping the outer collapse.
// Node-based runtime oracles can't execute `self`, so this spelling is locked here at text level
let calls = 0;
const it = (() => {
  calls++;
  return globalThis;
})().self.Symbol.iterator;
