// a navigation in the computed KEY of a deleted member, or in an argument of a call the deleted chain
// makes, is a value the engine reads before the operator acts, not a link of the deleted run: it lands
// where a plain read of it lands - nested in another key, in a conditional arm, or as the key of a
// member whose own run the delete folds onto the root binding
const holder = {};
const pick = {};
const pickHolder = () => holder;
let cond = true;
export const inKey = delete holder[globalThis.window.self.keySlot];
export const inNestedKey = delete holder[pick[globalThis.self.window.nestedSlot]];
export const inArmKey = delete holder[cond ? globalThis.window.self.armSlot : 'w'];
export const besideDeletedRun = delete globalThis.window.self[globalThis.window.self.besideSlot];
export const optionalInKey = delete holder[globalThis.window?.self.optionalSlot];
export const sequenceInKey = delete holder[(0, globalThis.window.self).sequenceSlot];
export const castInKey = delete holder[(globalThis.window as any).self.castSlot];
export const optionalAsArgument = delete pickHolder(globalThis.window?.self.optionalArgumentSlot).w;
export const sequenceAsArgument = delete pickHolder((0, globalThis.window.self).sequenceArgumentSlot).w;
