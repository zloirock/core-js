import _Map from "@core-js/pure/actual/map";
import _Map2 from "@core-js/pure/actual/map/constructor";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$keys from "@core-js/pure/actual/object/keys";
// a TS cast is TRANSPARENT to the container machinery on both of its ends: a cast around the INIT
// must not keep the binding off the container registry (its slot writes would then be dropped at
// publish time and a polyfill would override the program's replacement), and a cast around the WRITE
// target names the same slot. the clean twin resolves through the cast like through nothing
const clean = { k: Object } as { k: typeof Object };
const keys = _Object$keys;
const written = { k: Object } as { k: unknown };
(written as { k: unknown }).k = _Map;
const { k: { groupBy } } = written;
// a const-tuple cast on an ARRAY container is transparent the same way
const tuple = [Object] as const;
const entries = _Object$entries;
// a TYPE position does not detach a repositioner, while a non-null assertion is transparent to it
const typedOnly = [Object];
type TypedRead = typeof typedOnly.reverse;
const getOwnPropertyNames = _Object$getOwnPropertyNames;
const asserted = [Object, _Map2] as [typeof Object, typeof Map];
asserted!.reverse();
const { 0: { getOwnPropertyDescriptor } } = asserted;
export type { TypedRead };
export { keys, groupBy, entries, getOwnPropertyNames, getOwnPropertyDescriptor };