// `createParenthesizedExpressions: true` produces nested ParenthesizedExpression nodes for
// `(((expr)))`. peeling to the optional-call operand must walk through ALL paren levels, not
// unwrap once, else the outer optional chain fails to recognise the polyfilled member as its
// operand. combined here with TS-cast wrappers to exercise multi-level paren + TS unwrapping
const a = (((arr.at)))?.(0);
const b = (((str as any).padStart))?.(8);
