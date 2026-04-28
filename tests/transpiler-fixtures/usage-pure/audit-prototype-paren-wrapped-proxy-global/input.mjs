// proxy-global wrapped in parens at the leaf of the receiver chain
// (`(globalThis)?.X.prototype.method(...)`). `createParenthesizedExpressions: true`
// preserves the wrapper as an AST node above `globalThis`; substitution walker peels
// the wrapper and writes `_globalThis.X.prototype.method(...)`. tail-slice anchors at
// the wrapped leaf's end (past the closing `)`), so the splice doesn't leak the close
// paren into the substituted source
(globalThis)?.Array.prototype.at(0);
