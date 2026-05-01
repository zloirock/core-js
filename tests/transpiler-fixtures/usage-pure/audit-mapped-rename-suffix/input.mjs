// suffix-only template `as `${K}_id`` - rename appends to each key. expansion enumerates
// the source keys, evaluates the template per-key, body T[K] substitutes through to the
// source's typeAnnotation so `.at(0)` narrows to the array polyfill
type Suffix<T> = { [K in keyof T as `${string & K}_id`]: T[K] };
declare const r: Suffix<{ foo: number[] }>;
r.foo_id.at(0);
