// bare and call-returned proxy roots keep each tail's value and short-circuit: a live `?.` after
// the landing stays over the ternary, and a nullish fallback on a plain carrier wraps the whole
// folded value instead of binding to its alternate.
globalThis.bareHost = { a: 1 };
export const bareRootOptionalTail = globalThis.window?.self?.bareHost?.a;
export const bareRootCarrierTail = globalThis.window?.self.bareHost.a ?? 0;
export const callRootOptionalTail = (() => globalThis)()?.window?.self?.bareHost?.a;
