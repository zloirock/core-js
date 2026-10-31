// TS `as` wrapper around a computed key inside an `in`-expression is unwrapped.
// `((k) as any) in {}` still recognizes `k` as `Symbol.iterator`, so the
// `is-iterable` polyfill fires.
const k = Symbol.iterator;
const hasIter = ((k) as any) in {};
hasIter;
