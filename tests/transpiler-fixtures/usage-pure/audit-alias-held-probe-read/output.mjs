import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// an ALIAS holding an absent-able value: a PLAIN member claim erases the read the source
// performs (native throws where the alias is undefined), so the claim re-emits that read
// verbatim as a throw probe ahead of the ponyfill. the OPTIONAL twin keeps its guard channel,
// and an ALL-PLAIN held nav keeps the collapse assumption - that spelling declares the
// environment, no probe owed
const held = _globalThis.window?.Array;
export const plainReadCall = (held.of, _Array$of)(1);
export const plainRead = (held.from, _Array$from);
export const optionalRead = null == held ? void 0 : _Array$of(2);
let assigned;
assigned = _globalThis.window?.Array;
export const singleWriteRead = (assigned === Array ? _Array$of : assigned.of.bind(assigned))(3);
const chained = held;
export const chainAliasRead = (chained.of, _Array$of)(4);
// NEGATIVES: defined held values and the all-plain collapse keep today's renders
const allPlain = _globalThis.Array;
export const allPlainRead = _Array$of(6);
const definedHeld = _self;
export const definedRead = _Array$of(7);
const bareGlobal = _globalThis;
export const bareGlobalRead = _Array$of(8);

// wrapped twins of the plain alias read: a paren / TS-nonnull seal over the bare alias hides
// no short-circuit (the alias question stands), and an SE-bearing sequence peels to the tail
// with its prefix riding AHEAD of the probe - native runs it before the read throws
export const parenAliasRead = (held.of, _Array$of)(9);
let seqEffects = 0;
export const seqAliasRead = (seqEffects++, held.of, _Array$of)(10);
export { seqEffects };