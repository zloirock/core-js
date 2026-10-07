// A destructuring ASSIGNMENT whose init runs code claims the static off a `||` / `??` left read off the
// realm even where that left decides nothing (`Map`, its constructor entry excluded, while `groupBy` keeps its
// own): both operands, each polyfilled, stay ahead of the claim as written - in a bodyless slot, which becomes
// a block, and in a sequence element too.
let groupBy, grouped, byKey;
({ groupBy } = globalThis.Map || (log(), WeakSet));
if (ok) ({ groupBy: grouped } = globalThis.Map || (log(), Iterator));
export const keyed = (({ groupBy: byKey } = globalThis.Map ?? (make(), DisposableStack)), byKey(list, key));
export { groupBy, grouped };
