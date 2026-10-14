// a slot the source writes holds the user's object, and the read off a probe run reaches it there
// whichever spelling writes it and wherever: with no ponyfill to stand in for the slot, the guarded
// read composes with the probe's one test. a slot a ponyfill serves keeps the read its patch reaches
globalThis.assigned = [[1]];
globalThis.compounded += [];
delete globalThis.deleted;
[globalThis.destructured] = [[2]];
self.throughSelf = [3];
window.throughWindow = [4];
const g = globalThis;
g.throughAlias = [5];
globalThis.Map = [[6]];
export const assignedRead = globalThis.window?.self?.assigned.flat();
export const compoundedRead = globalThis.window?.self?.compounded.at(0);
export const deletedRead = globalThis.window?.self?.deleted.includes(1);
export const destructuredRead = globalThis.window?.self?.destructured.findLast(Boolean);
export const selfRead = globalThis.window?.self?.throughSelf.findLastIndex(Boolean);
export const windowRead = globalThis.window?.self?.throughWindow.toReversed();
export const aliasRead = globalThis.window?.self?.throughAlias.toSorted();
export const runRead = globalThis.window?.window?.assigned.flatMap(x => x);
export const laterRead = globalThis.window?.self?.later.fill(0);
export const ponyfilledRead = globalThis.window?.self?.Map.copyWithin(0);
globalThis.later = [7];
