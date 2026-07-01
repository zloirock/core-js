// Multi-level proxy-global chain via const-bound ObjectExpression hops: `ns.a.b` resolves
// to `globalThis`, then the remaining path continues with `Array`. Exercises the static
// receiver walk's recursive descent + the post-loop proxy-global lift simultaneously.
// Without the lift, the inner `globalThis` Identifier at depth=2 would bail (Identifier !==
// ObjectExpression AND remaining path non-empty), missing `from` polyfill emission silently
const ns = { a: { b: globalThis } };
const { a: { b: { Array: { from } } } } = ns;
export const arr = from([1, 2, 3]);
