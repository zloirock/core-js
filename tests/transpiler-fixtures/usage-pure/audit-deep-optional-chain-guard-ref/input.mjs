// Four-deep optional chain whose inner method is polyfillable: findChainRoot must
// emit a single `_ref` memoization for the entire object span, with `?.` collapsed
// across every link so the polyfill receives the chained value (not raw source).
a?.b?.c?.d?.at(0);
