// param-default synth-swap peels `ParenthesizedExpression` from AssignmentPattern's
// `right` slot when the parser keeps parens as nodes (`createParenthesizedExpressions:
// true`). The peel reaches the inner Identifier `Array` so synth-swap binds the receiver;
// without it, the wrapped `(Array)` would fail the Identifier check and fall back to
// inline-default
(({ from } = (Array)) => from([1]))();
