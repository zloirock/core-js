import _Array$from from "@core-js/pure/actual/array/from";
// an inner default whose receiver is wrapped in PARENS (`= (Array)`) is still the value-bearing host:
// oxc keeps the ParenthesizedExpression while babel folds it away, so peeling parens before the
// receiver-shape test makes both emitters resolve `from` to Array.from. without the peel the unplugin
// side treats the paren-wrapped receiver as a transparent empty fallback and drops the polyfill
function f([{
  from
} = {
  from: _Array$from
}]) {
  return from;
}
export const r = f([]);