// the global twin: the source keeps its text, so the decision is which modules the BURIED calls and
// the chain tail pull in - a row whose buried call stops resolving loses its own module here

// the inner instead aborted the build on a shape that composes. one method per row keeps it readable.
export const inBody = (() => (Array.from([1]), globalThis))()?.window?.Array.of(5).at(0);
export const inArgument = ((x) => globalThis)(Object.entries({ a: 1 }))?.window?.Set.prototype.has.call(new Set([1]), 1);
export const inEffectfulBody = (() => {
  Object.values({ b: 2 }).includes(2);
  return globalThis;
})()?.window?.Number.MAX_SAFE_INTEGER.toFixed(2);

// NEGATIVE: nothing polyfillable inside the root - the claim owns the whole span with no inner left
export const emptyRoot = (() => globalThis)()?.window?.Reflect.ownKeys({ c: 3 }).flatMap(key => [key]);
