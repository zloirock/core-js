// A MEMOIZED synth-swap receiver (SE-bearing, >=1 unpolyfilled key) takes the same canonical re-read target as the direct path:
// pure-ctor leaf whole-swaps with the erased navigation's effects harvested ahead of the binding; an alias root keeps its
// identifier and only drops the dead hop; a direct root collapses to the proxy import.
const g = globalThis;
function eff() { return null; }
function aliasNonPureLeaf({ fromEntries, missing } = (eff(), g.self.Object) || null) { return [fromEntries, missing]; }
aliasNonPureLeaf();
