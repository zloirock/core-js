// a global's own value written back into its slot through a pattern - a key read off the realm, a key under a
// realm hop, an element paired with a realm read - puts the whole entry into the slot, and a later read of the
// same global keeps working
({ Map } = globalThis);
({ self: { Set } } = globalThis);
[WeakMap] = [globalThis.WeakMap];
export const grouped = Map.groupBy([1, 2, 3], x => x % 2).get(1);
export const sized = new Set([1, 1]).size;
export const weak = new WeakMap([[grouped, 1]]).has(grouped);
