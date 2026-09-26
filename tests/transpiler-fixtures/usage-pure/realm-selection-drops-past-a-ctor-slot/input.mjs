// A selection whose arms all yield the realm serves constructor and static slots together.
// A user-object fallback keeps its own branch and members.
const { self: { Map: { groupBy: grouped }, Set: SetCtor } } = globalThis.window ?? globalThis;
const { Map: { groupBy: flatGrouped }, Set: FlatSet } = globalThis.window ?? globalThis;
const box = { Map, Set };
const { Map: { groupBy: keptGrouped }, Set: KeptSet } = globalThis.window ?? box;
export { grouped, SetCtor, flatGrouped, FlatSet, keptGrouped, KeptSet };
