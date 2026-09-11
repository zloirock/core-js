// a wks-key sibling joins the DEFAULT synth: the literal replaces the param default whole
// (`= { from: _Array$from, [_Symbol$iterator]: _getIteratorMethod(Array) }`), caller-correct
// by construction - it evaluates only when the caller omits the argument, so EXPORTED
// functions with invisible callers qualify too. all four binding shapes reshape uniformly;
// a user-written leaf default stays in the pattern (dead when the synth default fires,
// exactly as native leaves it dead when the ctor carries the static)
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
