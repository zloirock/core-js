// user parens around a claim END the optional chain: the call applies to the value the chain
// produced, so a nullish root must make the CALL throw where the unsealed spelling short-circuits
// the call away. the guard therefore stays inside the parens and the arguments stay outside
export const sealedStatic = (globalThis.window?.Array.of)(5);

// the same seal over a multi-hop navigation - the hop collapse is unaffected, only the boundary is
export const sealedDeepNav = (globalThis.window?.self.Math.trunc)(1.5);

// a doubled wrapper seals no differently: one terminator is enough and the second adds no layer.
// the reprint drops the redundant parens - formatting over the same guarded value
export const doubleSealed = ((globalThis.window?.Array.of))(5);

// an OPTIONAL invocation on the sealed value keeps its own `?.()`: the seal ends the SOURCE chain,
// and the user's optional call is a new one that short-circuits on the guard's undefined
export const sealedOptionalCall = (globalThis.window?.Array.of)?.(5);

// UNSEALED control - the call is inside the chain, so it folds into the guard's alternate and no
// call happens at all on the short-circuit path
export const inChainCall = globalThis.window?.Array.of(5);

// a member read past the seal is not a call: it reproduces the source's throw as a probe ahead of
// the claim, which is a channel of its own and must stay that way
export const sealedMemberRead = (globalThis.window?.self).Math.trunc(1.5);
