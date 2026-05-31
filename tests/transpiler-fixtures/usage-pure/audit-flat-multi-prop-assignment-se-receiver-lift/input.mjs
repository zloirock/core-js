// flat multi-prop AssignmentExpression destructure (`({ from, of } = (observe(from), Array))`)
// where every property resolves to a static polyfill and the receiver carries a side effect.
// native evaluates the whole RHS first, so `observe(from)` sees the OLD `from` (undefined) and
// must run BEFORE the extracted polyfill assignments - not interleaved between them. distinct
// statics (from / of) prove both props were extracted.
let from, of;
({ from, of } = (observe(from), Array));
