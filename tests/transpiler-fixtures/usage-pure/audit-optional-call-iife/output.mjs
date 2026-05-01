import _Array$from from "@core-js/pure/actual/array/from";
// Optional-call IIFE: `(({from}) => ...)?.(Array)`.
// `findIifeCallSite` accepts both `OptionalCallExpression` (babel) and chain-wrapped
// `CallExpression` (oxc), so synth-swap should still fire and rewrite the caller-arg
const r = (({
  from
}) => from([1, 2]))?.({
  from: _Array$from
});
export { r };