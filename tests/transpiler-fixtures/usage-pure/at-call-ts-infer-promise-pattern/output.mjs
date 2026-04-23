import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `T extends Promise<infer U> ? U : never` - user-rolled `Awaited<T>`. matchArrayInferPattern
// widened from Array/ReadonlyArray to every single-element container (Promise/Iterable/Set/...)
// so the inner unwrap fires uniformly. checkType `Promise<number[]>` -> `number[]`, `.at(-1)`
// picks the array-specific polyfill instead of falling through to generic
type Unwrap<T> = T extends Promise<infer U> ? U : never;
declare const p: Promise<number[]>;
declare const r: Unwrap<typeof p>;
_atMaybeArray(r).call(r, -1);