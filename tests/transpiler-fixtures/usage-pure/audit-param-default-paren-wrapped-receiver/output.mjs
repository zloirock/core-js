import _Array$from from "@core-js/pure/actual/array/from";
// param-default synth-swap must peel `ParenthesizedExpression` from the AssignmentPattern's
// `right` slot when the parser keeps parens as nodes (`createParenthesizedExpressions:
// true`). pre-fix `findTargetPath` checked `t.isIdentifier(wrapper.node.right)` against
// the raw right slot - `(Array)` wrapped in parens failed the check and synth-swap fell
// back to inline-default that didn't fire. post-fix `peelTransparentPath` reaches the
// inner Identifier through both parens and TS wrappers, mirroring unplugin's
// `unwrapParens(wrapper.right)` in `destructure-emit-utils.js`
(({
  from
} = ({
  from: _Array$from
})) => from([1]))();