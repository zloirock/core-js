// a global's own value written back into its slot through a realm member - from the bare name, from another
// realm name, from the same member - puts the whole entry into the slot, and a static's own value written back
// into the static puts the static's polyfill there
globalThis.Map = Map;
self.Set = globalThis.Set;
window.WeakMap = window.WeakMap;
Array.from = Array.from;
export const grouped = Map.groupBy([1, 2, 3], x => x % 2).get(1);
export const sized = new Set([1, 1]).size;
export const weak = new WeakMap([[grouped, 1]]).has(grouped);
export const listed = Array.from('ab');
