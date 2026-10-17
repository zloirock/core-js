globalThis.Set = class PatchedSet extends Set {};
// a mutated CONSTRUCTOR slot cancels the claim the same way a mutated static does
let c;
export const mutatedCtorSlot = (c = globalThis.window)?.self?.self.Set.name.at?.(0);
