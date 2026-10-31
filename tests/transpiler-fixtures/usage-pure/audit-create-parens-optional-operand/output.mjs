import _at from "@core-js/pure/actual/instance/at";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// `createParenthesizedExpressions: true` materializes parens as a `ParenthesizedExpression`
// AST node. peeling to the optional-call operand must look past it (not only TS wrappers),
// else with parens between member and optional call the outer `?.()` is not deoptionalized
// after the member is replaced.
const a = _at(arr)?.call(arr, 0);
const b = _padStartMaybeString(str)?.call(str, 8);