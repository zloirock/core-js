// OPTIONAL `.name` (MaybeFunction get) on a proxy chain-root-CALL receiver `(call)?.self.Ctor.name`. the
// `?.` guard memoizes the call into `_ref`, RUNNING its receiver-SE there exactly ONCE - the body must NOT
// re-emit that receiver-SE (it double-ran the call on BOTH emitters before) and must NOT inject a dead pure
// ctor import (the optional rebind keeps the raw `_ref.self.Ctor` hop off the memoized root, so no `_Map`).
// a computed key-SE folds into the guard's non-null branch (runs only when the receiver is non-nullish).
// distinct ctor + side-effect shape per line: bare root, a deep `.self.window` hop, a computed key-SE.
let n = 0;
const bareRoot = (() => { n += 1; return globalThis; })()?.self.Map.name;
const deepHop = (() => { n += 10; return globalThis; })()?.self.window.Set.name;
const keySe = (() => { n += 100; return globalThis; })()?.self[(n += 1000, "WeakMap")].name;
export { bareRoot, deepHop, keySe, n };
