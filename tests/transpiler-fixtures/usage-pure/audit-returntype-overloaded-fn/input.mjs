// `ReturnType<typeof overloaded>` must follow TS semantics and pick the last public overload.
// Last overload here is `string[]`, so `r.at?.(0)` narrows to the array polyfill.
declare function fn(): number;
declare function fn(): string[];
type R = ReturnType<typeof fn>;
declare const r: R;
r.at?.(0);
