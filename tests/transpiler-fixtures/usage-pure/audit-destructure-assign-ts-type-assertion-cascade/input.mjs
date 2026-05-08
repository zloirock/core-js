// TSTypeAssertion-wrapped destructure-assignment cascade lock (legacy `<T>expr` cast):
// the angle-bracket cast is compile-time only - runtime evaluates the inner AssignmentExpression
// directly. shared peelTransparentExprWrappers covers all members of TS_EXPR_WRAPPERS, so
// TSTypeAssertion threads through to the cascade just like TSAsExpression
let from;
<any>({ Array: { from } } = globalThis);
const arr = from([1, 2, 3]);
export { arr };
