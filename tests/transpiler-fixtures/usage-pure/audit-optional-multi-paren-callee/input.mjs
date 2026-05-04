// nested parens around the callee `((arr.at))?.(0)` under `createParenthesizedExpressions: true`:
// the optional-call's callee is ParenthesizedExpression(ParenthesizedExpression(arr.at)),
// so `isOptionalOperand` must peel BOTH paren layers to recognise `arr.at` as the operand
// of the optional call. distinct method on the next line so per-line dispatch is visible
const a = ((arr.at))?.(0);
const b = ((arr.flat))?.();
