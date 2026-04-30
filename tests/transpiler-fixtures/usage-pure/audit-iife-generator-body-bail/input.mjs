// generator IIFE - `function*() { return Map; }()` returns Generator<never, Map>, not Map.
// `inlineCallReturnExpression` rejects `callee.generator === true` so generator-call receivers
// don't mis-classify as the wrapped type. parallel to async; both wrappers leave the receiver
// type uncountable to the static type model
const a = (function*() {
  return Map;
}()).has(1);
const b = (function*() {
  return Set;
}()).intersection(new Set([1]));
export { a, b };
