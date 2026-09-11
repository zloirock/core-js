import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `readonly` and `?` modifiers on a mapped-passthrough type don't change the member set;
// `.at()` on `ReadonlyCopy<string[]>` should still resolve to the Array-specific polyfill
type ReadonlyCopy<T> = { readonly [K in keyof T]: T[K] };
declare const a: ReadonlyCopy<string[]>;
_atMaybeArray(a).call(a, 0);