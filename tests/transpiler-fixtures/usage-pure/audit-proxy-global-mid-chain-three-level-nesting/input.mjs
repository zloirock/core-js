// three-level Paren-wrapped chain: `((globalThis?.X)?.Y)?.Z.flat?.(0)`. rebuild must peel
// every Paren+Chain pair between hops and emit per-hop optional preservation: leaf-adjacent
// `?.X` collapses (polyfill always defined), mid-hops `?.Y` and `?.Z` preserve. asserts the
// rebuild loop handles N > 2 hops without losing optionality on intermediate segments.
((globalThis?.X)?.Y)?.Z.flat?.(0);
