// A selection every branch of which yields the REALM drops whole, so the plain CONSTRUCTOR slot and
// the hop's leaf beside it both bind their own ponyfill with no literal between them, under a
// shared proxy step and flat off the root alike. A fallback that is a user object is the negative:
// there the branch still decides, so the mirror stands and the slot rides its literal.
const { self: { Map: { groupBy: grouped }, Set: SetCtor } } = globalThis.window ?? globalThis;
const { Map: { groupBy: flatGrouped }, Set: FlatSet } = globalThis.window ?? globalThis;
const box = { Map, Set };
const { Map: { groupBy: keptGrouped }, Set: KeptSet } = globalThis.window ?? box;
export { grouped, SetCtor, flatGrouped, FlatSet, keptGrouped, KeptSet };
