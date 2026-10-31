// NESTED combined chains: the inner chain's own lookup test joins the enclosing test the same way
// a claim guard does, at any nesting depth
let w;
export const nestedCombined = (w = globalThis.window)?.self?.self.Array.of(5).flat?.().map?.(x => x).at?.(0);
