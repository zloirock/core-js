import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// TSIndexedAccessType `T[K]` on identity-rename mapped: `{ [K in keyof T]: T[K] }`
// is treated as passthrough; resolveIndexedAccessType walks through findTypeMember
// which descends via expandMappedTypeMembers when not a passthrough. Verify the
// indexed access integrates with the mapped expansion pipeline.
type Source = {
  fruits: string[];
  counts: number[];
};
type Identity<T> = { [K in keyof T]: T[K] };
declare const m: Identity<Source>['fruits'];
_atMaybeArray(m).call(m, 0);