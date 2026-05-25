// `createParenthesizedExpressions: true` produces nested ParenthesizedExpression nodes
// for `(((expr)))`. the peel loop in `isOptionalOperand` must walk through ALL paren
// levels - a single-pass (`if ParenthesizedExpression then unwrap once`) would miss the
// inner expression and the outer optional chain wouldn't recognise the polyfilled member
// as its operand. lock multi-level parens combined with TS-cast wrappers to exercise
// the same loop's interaction with TS expression wrappers
const a = (((arr.at)))?.(0);
const b = (((str as any).padStart))?.(8);
