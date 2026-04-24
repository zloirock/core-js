// Two-level TS mapped passthrough `MyWrap<T> -> Copy<T> -> { [K in keyof T]: T[K] }`.
// For `MyWrap<string[]>`, the mapped type passes the array type through unchanged,
// so `.at(0)` and `.flat()` resolve to the array-specific polyfills.
type Copy<T> = { [K in keyof T]: T[K] };
type MyWrap<T> = Copy<T>;
declare const a: MyWrap<string[]>;
a.at(0);
a.flat();
