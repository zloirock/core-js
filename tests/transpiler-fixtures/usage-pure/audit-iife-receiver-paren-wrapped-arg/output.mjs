import _Array$from from "@core-js/pure/actual/array/from";
// arrow IIFE receiver detection must peel `ParenthesizedExpression` (parser
// `createParenthesizedExpressions: true` keeps them as nodes) at every step of the
// SequenceExpression walk. pre-fix `unwrapSequenceTail` only peeled SE - paren-wrapped
// `(0, (1, Array))` and direct `(Array)` IIFE args bailed and left the synth-swap
// without a receiver, falling back to inline-default that didn't fire the polyfill.
// post-fix `peelTransparentPath` (TS wrappers + parens) inside the SE walk reaches
// the inner Identifier under any wrapper combination
(({
  from
}) => from([1]))((0, (1, {
  from: _Array$from
})));