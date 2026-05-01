import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// IIFE callee wrapped in mixed TS + paren + chain wrappers. Both parsers must reach
// the inner ArrowFunction through findIifeCallSite peelIifeCallee, applying every wrapper
// in TS_EXPR_WRAPPERS + IIFE_CALLEE_WRAPPERS until the function-like leaf appears
const a = ((((({ from }) => from(1)) as any))!)({ from: _Array$from });
const b = ((((({ of }) => of(2)) satisfies any)))({ of: _Array$of });