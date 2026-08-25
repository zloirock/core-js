import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// computed-key sibling forces body-extract instead of pattern reshape. all four binding
// shapes (shorthand / aliased, with and without default) extract uniformly. user-written
// defaults are intentionally dropped: the polyfill binding is always defined
// (immediately invoked: caller-lossy param emissions stay sound only when every call site is
// visible - a declared function's params now stay verbatim instead)
(function f({
  from = [],
  [_Symbol$iterator]: it
} = {
  from: _Array$from,
  [_Symbol$iterator]: _getIteratorMethod(Array)
}) {
  return [from([1]), it];
})();
(function g({
  from: alias = [],
  [_Symbol$iterator]: it
} = {
  from: _Array$from,
  [_Symbol$iterator]: _getIteratorMethod(Array)
}) {
  return [alias([2]), it];
})();
(function h({
  of,
  [_Symbol$iterator]: it
} = {
  of: _Array$of,
  [_Symbol$iterator]: _getIteratorMethod(Array)
}) {
  return [of(3), it];
})();
(function k({
  of: aliasOf,
  [_Symbol$iterator]: it
} = {
  of: _Array$of,
  [_Symbol$iterator]: _getIteratorMethod(Array)
}) {
  return [aliasOf(4), it];
})();