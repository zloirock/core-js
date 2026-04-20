import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `readonly` and `?` modifiers don't change the member set, only descriptor flags.
// unwrapMappedTypePassthrough walks through them; substituteTypeParams preserves
// typeParamMap through the passthrough body so `.at()` resolves Array-specific
type ReadonlyCopy<T> = { readonly [K in keyof T]: T[K] };
declare const a: ReadonlyCopy<string[]>;
_atMaybeArray(a).call(a, 0);