// computed-key sibling makes the ObjectPattern fail isSynthSimpleObjectPattern,
// forcing body-extract for the polyfillable bindings. each binding shape variant
// (shorthand / aliased / shorthand+default / aliased+default) goes through the
// uniform body-extract path. user-written defaults are intentionally dropped under
// the polyfill-always-wins contract: the polyfill binding is always defined so the
// `= []` default would never fire. distinct method names per declaration make per-
// import dispatch visible
function f({ from = [], [Symbol.iterator]: it } = Array) {
  return [from([1]), it];
}
function g({ from: alias = [], [Symbol.iterator]: it } = Array) {
  return [alias([2]), it];
}
function h({ of, [Symbol.iterator]: it } = Array) {
  return [of(3), it];
}
function k({ of: aliasOf, [Symbol.iterator]: it } = Array) {
  return [aliasOf(4), it];
}
export { f, g, h, k };
