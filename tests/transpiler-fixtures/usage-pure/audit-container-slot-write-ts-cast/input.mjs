// a TS cast is TRANSPARENT to the container machinery on both of its ends: a cast around the INIT
// must not keep the binding off the container registry (its slot writes would then be dropped at
// publish time and a polyfill would override the program's replacement), and a cast around the WRITE
// target names the same slot. the clean twin resolves through the cast like through nothing
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
