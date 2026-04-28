import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// proxy-global wrapped in parens at the leaf of the receiver chain
// (`(globalThis)?.X.prototype.method(...)`). `createParenthesizedExpressions: true`
// preserves the wrapper as an AST node above `globalThis`; substitution walker peels
// the wrapper and writes `_globalThis.X.prototype.method(...)`. tail-slice anchors at
// the wrapped leaf's end (past the closing `)`), so the splice doesn't leak the close
// paren into the substituted source
_atMaybeArray(_ref = _globalThis.Array.prototype).call(_ref, 0);