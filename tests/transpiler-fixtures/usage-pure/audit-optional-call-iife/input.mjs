// Optional-call IIFE: `(({from}) => ...)?.(Array)`.
// `findIifeCallSite` accepts both `OptionalCallExpression` (babel) and chain-wrapped
// `CallExpression` (oxc), so synth-swap should still fire and rewrite the caller-arg
const r = (({ from }) => from([1, 2]))?.(Array);
export { r };
