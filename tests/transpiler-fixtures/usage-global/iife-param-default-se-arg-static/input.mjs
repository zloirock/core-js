// IIFE param-default destructure: the caller-arg overrides the dead wrapper-default, so a
// statically-resolvable receiver hidden behind a SequenceExpression wrapper (minified / TS-emit
// form) must still classify to its bare global - `(0, Array)` -> `Array`, `(log(), Object)` ->
// `Object`. without peeling the caller-arg, detection resolved against the dead default and the
// static polyfill was dropped. distinct statics per line keep the per-line behavior clear
(({ from } = {}) => from([1, 2, 3]))((0, Array));
(({ fromEntries } = {}) => fromEntries([['a', 1]]))((log(), Object));
