import _at from "@core-js/pure/actual/instance/at";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
var _ref;
// `createParenthesizedExpressions: true` produces nested ParenthesizedExpression nodes for
// `(((expr)))`. peeling to the optional-call operand must walk through ALL paren levels, not
// unwrap once, else the outer optional chain fails to recognise the polyfilled member as its
// operand. combined here with TS-cast wrappers to exercise multi-level paren + TS unwrapping
const a = _at(arr)?.call(arr, 0);
const b = _padStartMaybeString(_ref = (str as any))?.call(_ref, 8);