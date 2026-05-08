import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// member-lookup through a conditional type whose true-branch is the inferred element:
// `T extends Promise<infer U> ? U : never`. findTypeMember must thread through the
// conditional + infer pattern so the receiver narrows to `string[]`. `.at()` shows the
// narrowing distinctly - array-narrowed `_atMaybeArray` vs the generic `_at` that would
// be picked when the inner type stays unresolved
type Unwrap<T> = T extends Promise<infer U> ? U : never;
declare const inner: Unwrap<Promise<string[]>>;
_atMaybeArray(inner).call(inner, 0);
_includesMaybeArray(inner).call(inner, 'a');