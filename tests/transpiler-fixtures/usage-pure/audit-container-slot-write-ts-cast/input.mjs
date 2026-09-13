// TS casts around a container initializer or write target preserve the slot identity.
// An unconditional Map write kills the initial Object candidate: pure keeps the native
// destructuring without an Object guard, and retains Map with its statics.
// Clean slots still resolve through casts; type positions do not mutate their values.
const clean = { k: Object } as { k: typeof Object };
const { k: { keys } } = clean;
const written = { k: Object } as { k: unknown };
(written as { k: unknown }).k = Map;
const { k: { groupBy } } = written;
// a const-tuple cast on an ARRAY container is transparent the same way
const tuple = [Object] as const;
const { 0: { entries } } = tuple;
// a TYPE position does not detach a repositioner, while a non-null assertion is transparent to it
const typedOnly = [Object];
type TypedRead = typeof typedOnly.reverse;
const { 0: { getOwnPropertyNames } } = typedOnly;
const asserted = [Object, Map] as [typeof Object, typeof Map];
asserted!.reverse();
const { 0: { getOwnPropertyDescriptor } } = asserted;
export type { TypedRead };
export { keys, groupBy, entries, getOwnPropertyNames, getOwnPropertyDescriptor };
