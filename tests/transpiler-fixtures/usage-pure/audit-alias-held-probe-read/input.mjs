// an ALIAS holding an absent-able value: a PLAIN member claim erases the read the source
// performs (native throws where the alias is undefined), so the claim re-emits that read
// verbatim as a throw probe ahead of the ponyfill. the OPTIONAL twin keeps its guard channel,
// and an ALL-PLAIN held nav keeps the collapse assumption - that spelling declares the
// environment, no probe owed
const held = globalThis.window?.Array;
export const plainReadCall = held.of(1);
export const plainRead = held.from;
export const optionalRead = held?.of(2);
let assigned;
assigned = globalThis.window?.Array;
export const singleWriteRead = assigned.of(3);
const chained = held;
export const chainAliasRead = chained.of(4);
// NEGATIVES: defined held values and the all-plain collapse keep today's renders
const allPlain = globalThis.window.Array;
export const allPlainRead = allPlain.of(6);
const definedHeld = globalThis.self;
export const definedRead = definedHeld.Array.of(7);
const bareGlobal = globalThis;
export const bareGlobalRead = bareGlobal.Array.of(8);

// wrapped twins of the plain alias read: a paren / TS-nonnull seal over the bare alias hides
// no short-circuit (the alias question stands), and an SE-bearing sequence peels to the tail
// with its prefix riding AHEAD of the probe - native runs it before the read throws
export const parenAliasRead = (held).of(9);
let seqEffects = 0;
export const seqAliasRead = (seqEffects++, held).of(10);
export { seqEffects };
