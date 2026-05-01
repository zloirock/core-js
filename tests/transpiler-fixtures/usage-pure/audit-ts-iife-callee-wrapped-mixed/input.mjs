// IIFE callee wrapped in mixed TS + paren + chain wrappers. Both parsers must reach
// the inner ArrowFunction through findIifeCallSite peelIifeCallee, applying every wrapper
// in TS_EXPR_WRAPPERS + IIFE_CALLEE_WRAPPERS until the function-like leaf appears
const a = ((((({ from }) => from(1)) as any))!)(Array);
const b = ((((({ of }) => of(2)) satisfies any)))(Array);
