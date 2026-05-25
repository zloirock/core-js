// `createParenthesizedExpressions: true` materializes parens as a `ParenthesizedExpression`
// AST node. `isOptionalOperand` walks parent.callee through TS expression wrappers only, which
// excludes ParenthesizedExpression. With parens between member and optional call, the
// outer `?.()` may not be deoptionalized after the member is replaced.
const a = (arr.at)?.(0);
const b = (str.padStart)?.(8);
