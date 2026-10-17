// A cast around the whole nav in CALLEE position seals the chain exactly as parens do, so the call applies to what the chain
// produced and throws on the short-circuited value.
let held: unknown;
export const castSealedCalleeAssignRoot = ((held = globalThis.window)?.self as any)(1);
