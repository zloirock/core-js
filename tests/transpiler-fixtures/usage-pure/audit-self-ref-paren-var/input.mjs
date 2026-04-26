// `var X = (X)` self-reference with parenthesised RHS: the parens must be peeled and
// the bare-identifier rewrite skipped to preserve TDZ semantics.
var Promise = (Promise);
Promise.resolve(1);
