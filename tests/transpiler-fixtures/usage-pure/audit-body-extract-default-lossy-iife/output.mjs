import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// computed-key sibling forces body-extract instead of pattern reshape. all four binding
// shapes (shorthand / aliased, with and without default) extract uniformly. user-written
// defaults are intentionally dropped: the polyfill binding is always defined
// (immediately invoked: caller-lossy param emissions stay sound only when every call site is
// visible - a declared function's params now stay verbatim instead)
(function f({
  [_Symbol$iterator]: it
} = Array) {
  let from = _Array$from;
  return [from([1]), it];
})();
(function g({
  [_Symbol$iterator]: it
} = Array) {
  let alias = _Array$from;
  return [alias([2]), it];
})();
(function h({
  [_Symbol$iterator]: it
} = Array) {
  let of = _Array$of;
  return [of(3), it];
})();
(function k({
  [_Symbol$iterator]: it
} = Array) {
  let aliasOf = _Array$of;
  return [aliasOf(4), it];
})();