import _at from "@core-js/pure/actual/instance/at";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// `createParenthesizedExpressions: true` materializes parens as a `ParenthesizedExpression`
// AST node. `isOptionalOperand` walks parent.callee through TS expression wrappers only, which
// excludes ParenthesizedExpression. With parens between member and optional call, the
// outer `?.()` may not be deoptionalized after the member is replaced.
const a = _at(arr)?.call(arr, 0);
const b = _padStartMaybeString(str)?.call(str, 8);