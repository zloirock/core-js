import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// user-rolled `Awaited<T>` via `T extends Promise<infer U> ? U : never`. the single-element
// container infer pattern applies to Promise / Iterable / Set / etc the same way it does to
// Array - `r` narrows to `number[]` through the conditional, so `.at(-1)` dispatches to the
// array-specific polyfill rather than a generic instance fallback
type Unwrap<T> = T extends Promise<infer U> ? U : never;
declare const p: Promise<number[]>;
declare const r: Unwrap<typeof p>;
_atMaybeArray(r).call(r, -1);