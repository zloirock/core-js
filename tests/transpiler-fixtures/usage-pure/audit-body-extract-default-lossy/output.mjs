import _Array$from from "@core-js/pure/actual/array/from";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _Array$of from "@core-js/pure/actual/array/of";
// computed-key sibling makes the ObjectPattern fail isSynthSimpleObjectPattern,
// forcing body-extract for the polyfillable bindings. each binding shape variant
// (shorthand / aliased / shorthand+default / aliased+default) goes through the
// uniform body-extract path. user-written defaults are intentionally dropped under
// the polyfill-always-wins contract: the polyfill binding is always defined so the
// `= []` default would never fire. distinct method names per declaration make per-
// import dispatch visible
function f({
  [_Symbol$iterator]: it
} = Array) {
  let from = _Array$from;
  return [from([1]), it];
}
function g({
  [_Symbol$iterator]: it
} = Array) {
  let alias = _Array$from;
  return [alias([2]), it];
}
function h({
  [_Symbol$iterator]: it
} = Array) {
  let of = _Array$of;
  return [of(3), it];
}
function k({
  [_Symbol$iterator]: it
} = Array) {
  let aliasOf = _Array$of;
  return [aliasOf(4), it];
}
export { f, g, h, k };