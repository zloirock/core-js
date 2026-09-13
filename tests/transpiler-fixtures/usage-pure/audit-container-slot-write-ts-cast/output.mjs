import _Map from "@core-js/pure/actual/map";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$keys from "@core-js/pure/actual/object/keys";
// TS casts around a container initializer or write target preserve the slot identity.
// An unconditional Map write kills the initial Object candidate: pure keeps the native
// destructuring without an Object guard, and retains Map with its statics.
// Clean slots still resolve through casts; type positions do not mutate their values.
const clean = {
  k: Object
} as {
  k: typeof Object;
};
const keys = _Object$keys;
const written = {
  k: Object
} as {
  k: unknown;
};
(written as {
  k: unknown;
}).k = _Map;
const {
  k: {
    groupBy
  }
} = written;
// a const-tuple cast on an ARRAY container is transparent the same way
const tuple = [Object] as const;
const entries = _Object$entries; // a TYPE position does not detach a repositioner, while a non-null assertion is transparent to it
const typedOnly = [Object];
type TypedRead = typeof typedOnly.reverse;
const getOwnPropertyNames = _Object$getOwnPropertyNames;
const asserted = [Object, _Map] as [typeof Object, typeof Map];
asserted!.reverse();
const {
  0: {
    getOwnPropertyDescriptor
  }
} = asserted;
export type { TypedRead };
export { keys, groupBy, entries, getOwnPropertyNames, getOwnPropertyDescriptor };