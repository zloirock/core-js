// a polyfill BURIED inside a kept chain root: the claim between them replaces the whole chain, so
// the buried rewrite has no slot there - it has one in the GUARD, which re-emits that root as its
// test. the fold has to reach past the claim to the transform that actually kept the text; blaming
// the inner instead aborted the build on a shape that composes. one method per row keeps it readable.
export const inBody = (() => (Array.from([1]), globalThis))()?.window?.Array.of(5).at(0);
export const inArgument = ((x) => globalThis)(Object.entries({ a: 1 }))?.window?.Set.prototype.has.call(new Set([1]), 1);
// a POLYFILLED prefix statement in the body forces a scoped `var` into it, and that injection must
// not put the body back as SOURCE - the render had already resolved the returned global there
export const inEffectfulBody = (() => {
  Object.values({ b: 2 }).includes(2);
  return globalThis;
})()?.window?.Number.MAX_SAFE_INTEGER.toFixed(2);

// NEGATIVE: nothing polyfillable inside the root - the claim owns the whole span with no inner left
export const emptyRoot = (() => globalThis)()?.window?.Reflect.ownKeys({ c: 3 }).flatMap(key => [key]);
