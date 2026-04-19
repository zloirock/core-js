// `await (import(...))` with preserved `ParenthesizedExpression` around the import call -
// `importExpressionSource` now unwraps parens before matching ImportExpression, so the
// entry resolves to `core-js/actual/array/from` instead of silently being ignored
await (import('core-js/actual/array/from'));
