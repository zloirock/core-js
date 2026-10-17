// Combined optional-call chains over a DOUBLE-hop kept-assign claim: the claim's root guard must not ride into a helper-GET
// argument or under a raw member read (a throw where native short-circuits) - it hoists into the outer test / over the raw tail on
// both emitters.
let n;
export const combinedTail = (n = globalThis.window)?.self?.self.Array.of(1).flat?.().at?.(0);
