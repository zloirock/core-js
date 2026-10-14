// A destructuring ASSIGNMENT whose init runs code only in its right claims the static off a `||` / `??` left read
// off the realm whose constructor entry is excluded (`Map`, while `groupBy` keeps its own): the left still decides
// - the data subset carries `Map` - so the right never runs and leaves with its imports, the claim alone written in
// place - in a bodyless slot, which stays a statement, and in a sequence element too.
let groupBy, grouped, byKey;
({ groupBy } = globalThis.Map || (log(), WeakSet));
if (ok) ({ groupBy: grouped } = globalThis.Map || (log(), Iterator));
export const keyed = (({ groupBy: byKey } = globalThis.Map ?? (make(), DisposableStack)), byKey(list, key));
export { groupBy, grouped };
