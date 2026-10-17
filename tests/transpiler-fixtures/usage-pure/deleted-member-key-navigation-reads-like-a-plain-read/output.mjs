import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a navigation in the computed KEY of a deleted member, or in an argument of a call the deleted chain
// makes, is a value the engine reads before the operator acts, not a link of the deleted run: it lands
// where a plain read of it lands - nested in another key, in a conditional arm, or as the key of a
// member whose own run the delete folds onto the root binding
const holder = {};
const pick = {};
const pickHolder = () => holder;
let cond = true;
export const inKey = delete holder[_self.keySlot];
export const inNestedKey = delete holder[pick[_self.nestedSlot]];
export const inArmKey = delete holder[cond ? _self.armSlot : 'w'];
export const besideDeletedRun = delete _globalThis[_self.besideSlot];
export const optionalInKey = delete holder[null == _globalThis.window ? void 0 : _self.optionalSlot];
export const sequenceInKey = delete holder[_self.sequenceSlot];
export const castInKey = delete holder[_self.castSlot];
export const optionalAsArgument = delete pickHolder(null == _globalThis.window ? void 0 : _self.optionalArgumentSlot).w;
export const sequenceAsArgument = delete pickHolder(_self.sequenceArgumentSlot).w;