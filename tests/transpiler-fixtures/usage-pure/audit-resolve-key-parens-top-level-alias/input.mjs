// parenthesized alias identifier `(k) in {}` where `k = Symbol.iterator` - parens must
// be transparent, so the `in`-check rewrites through the is-iterable polyfill
const k = Symbol.iterator;
const hasIter = (k) in {};
hasIter;
