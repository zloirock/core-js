import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a wks-key sibling joins the DEFAULT synth: the literal replaces the param default whole
// (`= { from: _Array$from, [_Symbol$iterator]: _getIteratorMethod(Array) }`), caller-correct
// by construction - it evaluates only when the caller omits the argument, so EXPORTED
// functions with invisible callers qualify too. all four binding shapes reshape uniformly;
// a user-written leaf default stays in the pattern (dead when the synth default fires,
// exactly as native leaves it dead when the ctor carries the static)
function f({
  from = [],
  [_Symbol$iterator]: it
} = {
  from: _Array$from,
  [_Symbol$iterator]: _getIteratorMethod(Array)
}) {
  return [from([1]), it];
}
function g({
  from: alias = [],
  [_Symbol$iterator]: it
} = {
  from: _Array$from,
  [_Symbol$iterator]: _getIteratorMethod(Array)
}) {
  return [alias([2]), it];
}
function h({
  of,
  [_Symbol$iterator]: it
} = {
  of: _Array$of,
  [_Symbol$iterator]: _getIteratorMethod(Array)
}) {
  return [of(3), it];
}
function k({
  of: aliasOf,
  [_Symbol$iterator]: it
} = {
  of: _Array$of,
  [_Symbol$iterator]: _getIteratorMethod(Array)
}) {
  return [aliasOf(4), it];
}
export { f, g, h, k };