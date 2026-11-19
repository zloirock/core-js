// Optional-call IIFE: `(({from}) => ...)?.(Array)`. the IIFE call site is recognized for
// both `OptionalCallExpression` (babel) and chain-wrapped `CallExpression` (oxc), so the
// synth-swap still fires and rewrites the caller-arg.
const r = (({ from }) => from([1, 2]))?.(Array);
export { r };
