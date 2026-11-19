import _Array$from from "@core-js/pure/actual/array/from";
// Optional-call IIFE: `(({from}) => ...)?.(Array)`. the IIFE call site is recognized for
// both `OptionalCallExpression` (babel) and chain-wrapped `CallExpression` (oxc), so the
// synth-swap still fires and rewrites the caller-arg.
const r = (({
  from
}) => from([1, 2]))?.({
  from: _Array$from
});
export { r };