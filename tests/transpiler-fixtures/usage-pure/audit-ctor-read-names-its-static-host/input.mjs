// the `?.` over a CONSTRUCTOR read off the realm is dead - the static below it substitutes an
// always-defined binding - but the deopt named its host through the proxy-HOP resolver, which
// answers for `self` and `window` and not for `Number`. with no name the guard stayed live, the
// claim under it read raw off the ponyfill, and the polyfill never landed. the store and the
// sequence around the receiver are carriers only: the value they hand on decides.
// the other half of the rule - a proxy HOP is not a constructor read, and naming it here erases a
// probe's own guard - is locked by `audit-erase-claim-swallowed-optional-token`
let v, g, out, plain, stored, probeStored, seqStored;
plain = globalThis.self.Number?.MAX_SAFE_INTEGER.name;
stored = (v = globalThis.self).Number?.MAX_SAFE_INTEGER.name;
// the PROBE store is where the miss cost an import outright: with no name the claim read the static
// natively off the ponyfill, and a realm without it answers undefined
probeStored = (v = globalThis.window?.self).Number?.MAX_SAFE_INTEGER.name;
seqStored = (g = globalThis, v = (g.window, globalThis.self)).Number?.MAX_SAFE_INTEGER.name;
out = [plain, stored, probeStored, seqStored];
export const read = out;
