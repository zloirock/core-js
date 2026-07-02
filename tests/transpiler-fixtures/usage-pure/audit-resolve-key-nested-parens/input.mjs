// Multiply-nested parens around a computed key `((k))` still resolve through to
// `Symbol.iterator`, so the specialized `is-iterable` polyfill fires.
const k = Symbol.iterator;
const hasIter = ((k)) in {};
hasIter;
