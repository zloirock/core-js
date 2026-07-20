// combined optional-call chains over a DOUBLE-hop kept-assign claim: the claim's root guard
// must not ride into a helper-GET argument or under a raw member read (a throw where native
// short-circuits) - it hoists into the outer test / over the raw tail on both emitters. the
// guard-hoist direction differs per shape (the outer test may queue before or after the claim),
// so each line locks one protocol direction
let n;
let t;
let c;
let u;
export const combinedTail = (n = globalThis.window)?.self?.self.Array.of(1).flat?.().at?.(0);
export const combinedNoTail = (t = globalThis.window)?.self?.self.Array.of(2).flat?.();
export const optionalAccess = (c = globalThis.window)?.self?.self.Array.of(3)?.flat?.();
export const rawMethodTail = (u = globalThis.window)?.self?.self.Array.of(4).userMethod?.();
// NESTED combined chains: the inner chain's own OR-guard is a guarded producer too - it hoists
// into the enclosing test the same way a claim guard does, at any nesting depth
let w;
export const nestedCombined = (w = globalThis.window)?.self?.self.Array.of(5).flat?.().map?.(x => x).at?.(0);
// a SECOND kept chain nested in the claim's ARGUMENT keeps its own guard and claims - the
// composed needle carries the nested chain's live `?.` (only the outer chain's hops deopt)
let a;
let b;
export const nestedKeptArg = (a = globalThis.window)?.self?.self.Array.of((b = globalThis.window)?.self.Set.name).flat?.();
