// `cond ? (logCall(), Array) : Iterator` - SE prefix with observable side effects. peel
// reaches the SE tail unconditionally for synth-swap viability check; the prefix stays in
// the AST around the substitution target so `logCall()` runs at runtime, only the tail
// Identifier is replaced. both branches resolve their `from` polyfill
declare function logCall(): void;
const { from } = cond ? (logCall(), Array) : Iterator;
from([1, 2, 3]);
