// IIFE callee wrapped in mixed TS + paren + chain wrappers. Both parsers must reach
// the inner ArrowFunction through the IIFE-callee peel, applying every TS-expr +
// IIFE-callee wrapper until the function-like leaf appears
const a = ((((({ from }) => from(1)) as any))!)(Array);
const b = ((((({ of }) => of(2)) satisfies any)))(Array);
