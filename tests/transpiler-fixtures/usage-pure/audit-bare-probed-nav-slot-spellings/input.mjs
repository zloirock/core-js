// a BARE probed nav as a destructure SOURCE (`{ structuredClone } = (globalThis.window?.self)`): the
// collapse consumes the whole pattern, so nothing is left to carry the read native performs off the
// probe VALUE - it is re-emitted as a throw probe on the surviving slot. the slot was read as an
// Identifier key ONLY, so the same slot spelled as a static string or a single-quasi template lost
// that probe and ANSWERED where native throws (`TypeError: Cannot destructure ... as it is undefined`
// off-window). one slot, one behaviour, whatever the spelling.
// the two negatives keep their own channel and must NOT grow a probe: a computed key with its own
// effect (its residual re-reads the source, so the throw is already there) and a slot name that is
// not spellable bare - which the probe re-reads computed rather than dotted.
// the sidecar records ONE difference and it is cosmetic: on the two residual lines the text splice
// keeps the parens the source wrote around the guard, the AST reprint drops them.
let c = 0;
const { structuredClone: dotted } = (globalThis.window?.self);
const { ["structuredClone"]: computed } = (globalThis.window?.self);
const { [`structuredClone`]: template } = (globalThis.window?.self);
const { [(c += 1, "structuredClone")]: seKey } = (globalThis.window?.self);
const { ["a-b"]: notBare, structuredClone: beside } = (globalThis.window?.self);
export { dotted, computed, template, seKey, notBare, beside, c };
