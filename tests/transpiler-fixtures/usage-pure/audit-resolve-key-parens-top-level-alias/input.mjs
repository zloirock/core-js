// oxc-parser preserves ParenthesizedExpression on `(k)` - resolveKey must unwrap to resolve
// `k` through const-alias to `Symbol.iterator`. babel path strips parens so both converge
const k = Symbol.iterator;
const hasIter = (k) in {};
hasIter;
