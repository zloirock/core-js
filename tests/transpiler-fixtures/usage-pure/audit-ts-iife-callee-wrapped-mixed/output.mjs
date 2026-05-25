import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// IIFE callee wrapped in mixed TS + paren + chain wrappers. Both parsers must reach
// the inner ArrowFunction through the IIFE-callee peel, applying every TS-expr +
// IIFE-callee wrapper until the function-like leaf appears
const a = ((({
  from
}) => from(1)) as any)!({
  from: _Array$from
});
const b = ((({
  of
}) => of(2)) satisfies any)({
  of: _Array$of
});