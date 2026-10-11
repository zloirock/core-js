// the realm NAME `globalThis` read ahead of its own install (`window.globalThis = window`) is the realm this build
// serves - as a key off another realm, under an operator, as an arm of a selection or as a destructured level - so
// each spelling reads like its install-free twin
export const keyIn = self.globalThis.Symbol.iterator in obj;
export const keyRead = obj[self.globalThis.Symbol.asyncIterator];
export const deleted = delete self.globalThis.customSlot;
export const selectedHop = (c ? self.globalThis : globalThis).Array.from(list);
export const selectedArm = (c ? globalThis : user).Map.groupBy;
const { globalThis: { Array: { of }, ...rest } } = self;
export const { Array: { from } } = self.globalThis;
export { of, rest };
window.globalThis = window;
