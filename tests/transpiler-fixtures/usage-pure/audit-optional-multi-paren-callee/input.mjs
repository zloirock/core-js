// nested parens around the callee `((arr.at))?.(0)` under `createParenthesizedExpressions: true`:
// the optional-call's callee is ParenthesizedExpression(ParenthesizedExpression(arr.at)), so
// BOTH paren layers must be peeled to recognise `arr.at` as the optional call's operand.
// distinct method on the next line so per-line dispatch is visible.
const a = ((arr.at))?.(0);
const b = ((arr.flat))?.();
