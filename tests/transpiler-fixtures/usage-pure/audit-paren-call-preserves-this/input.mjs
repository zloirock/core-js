// `(arr.includes)(1)` with `createParenthesizedExpressions: true` parses as a
// CallExpression whose callee is a ParenthesizedExpression wrapping the member access.
// Polyfill emission peels through the parens so the receiver binds correctly: the
// emitted `.call(arr, ...)` keeps `this === arr` regardless of paren wrapping
(arr.includes)(1);
