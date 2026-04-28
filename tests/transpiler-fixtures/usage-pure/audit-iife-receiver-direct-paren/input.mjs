// IIFE arg directly wrapped in `ParenthesizedExpression` (no SequenceExpression) under
// `createParenthesizedExpressions: true`: paren peel runs at the entry of IIFE-arg
// resolution so the inner Identifier reaches the receiver classifier. Without this peel
// the synth-swap would fall back to inline-default
(({from}) => from([1]))((Array));
