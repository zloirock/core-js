// `createParenthesizedExpressions: true` materializes parens as a `ParenthesizedExpression`
// AST node. peeling to the optional-call operand must look past it (not only TS wrappers),
// else with parens between member and optional call the outer `?.()` is not deoptionalized
// after the member is replaced.
const a = (arr.at)?.(0);
const b = (str.padStart)?.(8);
