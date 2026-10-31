// OPTIONAL `.name` (MaybeFunction get) on a proxy chain-root-CALL receiver `(call)?.self.Ctor.name`. the
// `?.` guard memoizes the call into `_ref`, RUNNING its receiver-SE there exactly ONCE - the body must NOT
// re-emit that receiver-SE (it double-ran the call on BOTH emitters before). the receiver is receiver-
// INDEPENDENT (a proxy chain to a pure ctor), so it collapses to the pure binding (`_Map`) and the guard
// serves only the null-check; the `.self` (and `.self.window`) proxy hops drop. a computed key-SE is a TAIL
// effect past the root, so it folds ahead of the pure ctor in the non-null branch (`(n += 1000, _WeakMap)`,
// runs only when the receiver is non-nullish). distinct ctor + side-effect shape per line: bare root, a deep
// `.self.window` hop, a computed key-SE, and a computed key-SE ABOVE a prototype TAIL.
// the LAST case is the key one: a `.prototype.add` tail past the static does not hold the ctor back - the
// key-SE migrates ahead of the whole-swap as a sequence prefix (`(n += 1e5, _Set).prototype.add`), the same
// shape a DIRECT static leaf takes. reading it off the memo instead (`_ref[n += 1e5, 'Set'].prototype.add`)
// kept the key but lost the ponyfill: a native `Set` read, absent on the engines this method targets.
let n = 0;
const bareRoot = (() => { n += 1; return globalThis; })()?.self.Map.name;
const deepHop = (() => { n += 10; return globalThis; })()?.self.window.Set.name;
const keySe = (() => { n += 100; return globalThis; })()?.self[(n += 1000, "WeakMap")].name;
const keySeTail = (() => { n += 10000; return globalThis; })()?.self[(n += 1e5, "Set")].prototype.add.name;
export { bareRoot, deepHop, keySe, keySeTail, n };
