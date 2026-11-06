import _Map from "@core-js/pure/actual/map";
// TS casts preserve container identity around both initializers and writes.
// Native slot reads retain full replacement constructors; type-only uses do not mutate the container.
const clean = {
  k: Object
} as {
  k: typeof Object;
};
const {
  k: {
    keys
  }
} = clean;
const written = {
  k: Object
} as {
  k: unknown;
};
(written as {
  k: unknown;
}).k = _Map;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
const {
  k: {
    groupBy
  }
} = written;
// a const-tuple cast on an ARRAY container is transparent the same way
const tuple = [Object] as const;
const {
  0: {
    entries
  }
} = tuple;
// a TYPE position does not detach a repositioner, while a non-null assertion is transparent to it
const typedOnly = [Object];
type TypedRead = typeof typedOnly.reverse;
const {
  0: {
    getOwnPropertyNames
  }
} = typedOnly;
const asserted = [Object, _Map] as [typeof Object, typeof Map];
asserted!.reverse();
const {
  0: {
    getOwnPropertyDescriptor
  }
} = asserted;
export type { TypedRead };
export { keys, groupBy, entries, getOwnPropertyNames, getOwnPropertyDescriptor };