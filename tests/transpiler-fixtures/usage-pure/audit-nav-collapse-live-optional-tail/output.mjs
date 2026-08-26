import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Number$MIN_SAFE_INTEGER from "@core-js/pure/actual/number/min-safe-integer";
import _self from "@core-js/pure/actual/self";
// the TAIL a nav collapse does not absorb, in the three spellings the source can write it. the hops
// above the collapsed leaf are re-hung on the ponyfill exactly as written: a computed key stays
// computed (respelled by name it would read a different property on a non-identifier key), and a
// `?.` survives only where the value below it can still short-circuit - over the always-defined
// ponyfill leaf it is vestigial and drops. one claim per row, so a row that stops resolving leaves
// a hole in the import set.
let plainTail, computedTail, liveOptionalTail, vestigialOptionalTail, mixedTail;
export const plain = (plainTail = _self.window, _Number$MAX_SAFE_INTEGER);
export const computed = (computedTail = _self['window'], _Number$MIN_SAFE_INTEGER);
export const liveOptional = (liveOptionalTail = _self.window?.top).Number.EPSILON;
export const vestigialOptional = (vestigialOptionalTail = _self.window).Number.MAX_VALUE;
export const mixed = (mixedTail = _self['window']?.top).Number.MIN_VALUE;