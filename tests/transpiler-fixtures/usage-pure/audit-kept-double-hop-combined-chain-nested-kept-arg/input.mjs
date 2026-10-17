// a SECOND kept chain nested in the claim's ARGUMENT keeps its own guard and claims - the
// composed needle carries the nested chain's live `?.` (only the outer chain's hops deopt)
let a;
let b;
export const nestedKeptArg = (a = globalThis.window)?.self?.self.Array.of((b = globalThis.window)?.self.Set.name).flat?.();
