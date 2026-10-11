// a global's own value written back into its slot through the bare name - read off a realm name, off another
// realm name, by a logical write - puts the whole entry into the slot, where other code reads its statics off
// the realm. a later read of the same global keeps working
Map = globalThis.Map;
Set = self.Set;
WeakMap &&= window.WeakMap;
export const grouped = Map.groupBy([1, 2, 3], x => x % 2).get(1);
export const sized = new Set([1, 1]).size;
export const weak = new WeakMap([[grouped, 1]]).has(grouped);
