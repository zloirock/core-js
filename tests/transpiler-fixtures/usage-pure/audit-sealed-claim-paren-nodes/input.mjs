// the same seals with REAL paren nodes in the AST: under `createParenthesizedExpressions` the
// grouping is a node rather than a flag, and every walk that reads only the flag stops seeing the
// seal. the guard a claim renders must stay INSIDE the helper that consumes it either way
// the sidecar here is COSMETIC and nothing more: both legs render the read the seal makes
// observable, and differ only in printer parens and blank lines around the spliced spans
export const sealedCtorLeaf = (globalThis.window?.Map).name;

export const sealedDeepCtorLeaf = (globalThis.window?.self.Map).name;

export const sealedAbsorbedHop = delete (globalThis.window?.self).self.box.at;

const host = {};
export const sealedStartParen = (host.box?.missing).flat?.().at(0);

// a DEEP sealed nav reaches the guard channel only if the plan peels this spelling of the seal
// too: stopping at the paren node routed the same source through the erase instead, and the guard
// the flag spelling keeps was dropped - a write host then targeted the live realm global
export let assigned;

export function deepSealedWrite(v) {
  (globalThis.self.window?.self).Box = v;
}
export const deepSealedRead = (globalThis.self.window?.self).Box;

// a sealed CALLEE ends the chain, so the call applies to the guard's VALUE and must stay OUTSIDE
// the ternary: folded into the alternate it would answer `undefined` where the source calls an
// undefined value and throws. the seal is this very node here, not a layer above it
export const sealedCallee = (globalThis.window?.self)(1);
export const sealedCalleeAssignRoot = ((assigned = globalThis.window)?.self)(1);
export const sealedTag = (globalThis.window?.self)`x`;
export const sealedNew = new (globalThis.window?.self)();

// NEGATIVE: the seal consumed by a live `?.` has no plain read above it, so the claim proceeds
export const optionalConsumer = (globalThis.window?.self)?.Array.of(1);
