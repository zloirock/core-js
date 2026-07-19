// OPTIONAL `.name` (MaybeFunction get) on a proxy chain-root-CALL receiver `(call)?.self.Ctor.name`. the
// `?.` guard memoizes the call into `_ref`, RUNNING its receiver-SE there exactly ONCE - the body must NOT
// re-emit that receiver-SE (it double-ran the call on BOTH emitters before). the receiver is receiver-
// INDEPENDENT (a proxy chain to a pure ctor), so it collapses to the pure binding (`_Map`) and the guard
// serves only the null-check; the `.self` (and `.self.window`) proxy hops drop. a computed key-SE is a TAIL
// effect past the root, so it folds ahead of the pure ctor in the non-null branch (`(n += 1000, _WeakMap)`,
// runs only when the receiver is non-nullish). distinct ctor + side-effect shape per line: bare root, a deep
// `.self.window` hop, a computed key-SE.
let n = 0;
const bareRoot = (() => { n += 1; return globalThis; })()?.self.Map.name;
const deepHop = (() => { n += 10; return globalThis; })()?.self.window.Set.name;
const keySe = (() => { n += 100; return globalThis; })()?.self[(n += 1000, "WeakMap")].name;
export { bareRoot, deepHop, keySe, n };
