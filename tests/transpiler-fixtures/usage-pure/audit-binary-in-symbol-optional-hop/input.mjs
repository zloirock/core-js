// a live `?.` on the LHS chain to the symbol: the rewrite would swap the LHS for an
// always-defined binding, silently flipping the membership answer where native tests the key
// `"undefined"` - so the `in` stays live text and the LHS keeps its own guarded substitution.
// chains that cannot short-circuit keep the rewrite
export const guardedIterator = globalThis.window?.Symbol.iterator in [];
export const guardedAsync = globalThis.window?.Symbol.asyncIterator in [];
export const guardedDeep = globalThis.window?.self.Symbol.iterator in [];

// NEGATIVES: the rewrite fires where the chain cannot short-circuit
export const plainChain = globalThis.Symbol.iterator in [];
export const resolvableHop = globalThis.self?.Symbol.iterator in [];
export const bareSymbol = Symbol.iterator in [];
