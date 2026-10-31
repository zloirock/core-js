// member-lookup through a conditional type whose true-branch is the inferred element:
// `T extends Promise<infer U> ? U : never`. type-member lookup must thread through the
// conditional + infer pattern so the receiver narrows to `string[]`. `.at()` shows the
// narrowing distinctly - array-narrowed `_atMaybeArray` vs the generic `_at` that would
// be picked when the inner type stays unresolved
type Unwrap<T> = T extends Promise<infer U> ? U : never;
declare const inner: Unwrap<Promise<string[]>>;
inner.at(0);
inner.includes('a');
