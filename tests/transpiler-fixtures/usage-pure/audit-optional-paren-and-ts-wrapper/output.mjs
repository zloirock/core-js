import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// paren + TS combined: `((arr.at) as any)?.(0)`. With `createParenthesizedExpressions: true`,
// the optional-call's callee is TSAsExpression(ParenthesizedExpression(arr.at)), which means
// peel must alternate TS wrappers AND parens to reach `arr.at` for `isOptionalOperand` match.
// distinct methods to observe per-line dispatch
const a = _at(arr)?.call(arr, 0);
const b = _flatMaybeArray(arr)?.call(arr);