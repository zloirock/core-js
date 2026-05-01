import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// union extends-side `K extends 'a' | 'b' ? K : never` - any-branch-matches semantics.
// matchesConditionalPattern returns true on the first matching union member without
// over-defining the others; non-matching keys translate to RENAME_SKIP via the never branch
type Pick2<T> = { [K in keyof T as K extends 'a' | 'b' ? K : never]: T[K] };
declare const r: Pick2<{ a: number[]; b: string[]; c: boolean }>;
_atMaybeArray(_ref = r.a).call(_ref, 0);