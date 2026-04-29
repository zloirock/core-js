// Four-deep optional chain whose inner method is polyfillable: a single `_ref`
// memoization covers the entire object span, with `?.` collapsed across every link
// so the polyfill receives the chained value (not the raw source).
a?.b?.c?.d?.at(0);
