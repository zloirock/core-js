// a sequence prefix under a SEALED proxy navigation is re-emitted verbatim by the probe, so a claim
// living in that prefix has to keep its own rewrite and compose into the re-emission. skipping the
// whole consumed subtree shipped the prefix raw, while the unsealed spelling of the same source
// polyfilled it - one source, two answers, decided by a paren.
const log = [];
let n = 0;
export const sealedPrefixClaim = ((log.push('x'), globalThis.window)?.self).Array.of(1).at(0);
export const unsealedPrefixClaim = (log.push('y'), globalThis.window)?.self.Array.of(1);
export const sealedPrefixTwoClaims = ((log.push('z'), log.at(0), globalThis.window)?.self).Array.of(2);
// NEGATIVE: a prefix effect that claims nothing re-emits verbatim either way
export const nonClaimPrefix = ((n++, globalThis.window)?.self).Array.of(3);
