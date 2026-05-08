// computed-key sibling forces body-extract instead of pattern reshape. all four binding
// shapes (shorthand / aliased, with and without default) extract uniformly. user-written
// defaults are intentionally dropped: the polyfill binding is always defined
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
