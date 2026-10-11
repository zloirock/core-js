// a global's own value written back into its slot from its own bare name, or down a chain of writes through
// realm members, puts the whole entry into the slot, and a later read of the same global keeps working
Map = Map;
Set = globalThis.Set = self.Set;
export const grouped = Map.groupBy([1, 2, 3], x => x % 2).get(1);
export const sized = new Set([1, 1]).size;
