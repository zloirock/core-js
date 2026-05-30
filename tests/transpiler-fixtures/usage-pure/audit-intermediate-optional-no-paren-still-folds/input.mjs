// Contrast to the paren-terminated cases: an optional hop in the MIDDLE of a chain with
// no terminating parentheses keeps the whole expression as one optional chain. The outer
// `.includes` is a genuine continuation of the chain, so a nullish inner result must
// short-circuit the entire chain to undefined - and the polyfilled inner and outer calls
// SHOULD fold into one short-circuiting OR-chain. This proves the paren gate stays narrow
// and does not over-bail on ordinary mid-chain optionals.
const r = arr.flatMap?.(x => x).includes(3);
