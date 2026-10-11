// a value written into a name no declaration reaches lands in the realm's slot of that name, out of the file: the
// constructor it holds takes its whole entry, written flat or through a pattern. a name the file declares keeps
// its value home, on the narrow entry
Holder = Map;
({ Set: Hook } = globalThis);
let local;
local = WeakMap;
export const grouped = Holder.groupBy([1, 2, 3], x => x % 2).get(1);
export const sized = new Hook([1, 1]).size;
export const weak = new local([[grouped, 1]]).has(grouped);
