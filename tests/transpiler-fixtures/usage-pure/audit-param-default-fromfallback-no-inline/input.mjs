// `function f({key} = cond ? A : B)` - the param-default expression evaluates per-call;
// runtime picks Array or Set, so a static inline-default would mis-bind one branch.
// `handleDestructuringPure` already filters via `if (meta.fromFallback) return`;
// `handleParameterDestructurePure` (function-param path) replicates the bail
function f({ from } = cond ? Array : Set) { return from; }
function g({ groupBy } = cond ? Map : WeakMap) { return groupBy; }
function h({ try: t } = pickPromise() ?? Promise) { return t; }
export { f, g, h };
