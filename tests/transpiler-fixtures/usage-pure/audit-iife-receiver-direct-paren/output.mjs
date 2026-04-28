import _Array$from from "@core-js/pure/actual/array/from";
// IIFE arg directly wrapped in `ParenthesizedExpression` (no SequenceExpression at all)
// under `createParenthesizedExpressions: true`: `peelTransparentPath` at the entry of
// `unwrapSequenceTail` peels the parens FIRST so the inner Identifier reaches
// `findTargetPath`'s classification. pre-fix the SE-only walk left the parens in place
// and the synth-swap fell back to inline-default
(({
  from
}) => from([1]))(({
  from: _Array$from
}));