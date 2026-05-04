// generic alias with self-referential default: `Self<T = T[]>`. when resolved without
// concrete arg, default `T[]` references T which substitutes back to default - cycle.
// `applyAliasSubstDeep`'s `visited` Set tracks param names being expanded; second
// visit to T short-circuits to bare reference instead of recursing forever. depth bound
// catches it eventually but allocates O(MAX_DEPTH) frames of CPU; visited cuts it short
type Self<T = T[]> = { items: T };
declare const r: Self;
r.items.at(0);
r.items.findLast(p => p);
