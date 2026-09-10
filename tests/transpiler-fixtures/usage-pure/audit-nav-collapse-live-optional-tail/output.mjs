import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Number$MIN_SAFE_INTEGER from "@core-js/pure/actual/number/min-safe-integer";
import _Number$parseFloat from "@core-js/pure/actual/number/parse-float";
import _self from "@core-js/pure/actual/self";
// the TAIL a nav collapse does not absorb, in the spellings the source can write it. the hops above
// the collapsed leaf are re-hung on the ponyfill exactly as written: a key the hop-name canon cannot
// take stays computed (respelled by name it would read a different property on a non-identifier
// key), while one it CAN name is the dotted hop in disguise and folds with the run, and every `?.`
// here is vestigial - each hop below it resolves, so the guard drops - which is why the mixed
// spelling reads exactly like its dotted twin. the three resolving tails carry the import claims,
// the rows that stop at an unresolvable hop are pinned by their re-hung spelling instead.
let plainTail, computedTail, nameableKeyTail, liveOptionalTail, vestigialOptionalTail, mixedTail;
let k = 0;
export const plain = (plainTail = _self, _Number$MAX_SAFE_INTEGER);
export const computed = (computedTail = _self[k++, 'window'], _Number$MIN_SAFE_INTEGER);
export const nameableKey = (nameableKeyTail = _self, _Number$parseFloat)('1.5');
export const liveOptional = (liveOptionalTail = _self.top).Number.EPSILON;
export const vestigialOptional = (vestigialOptionalTail = _self).Number.MAX_VALUE;
export const mixed = (mixedTail = _self.top).Number.MIN_VALUE;