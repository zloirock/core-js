// `typeof obj.inner.data` with 3+ qualified-name segments. the type-query function-type lookup
// walks the root binding's annotation segment-by-segment via the structural member lookup (arbitrary
// depth), so ReturnType<typeof obj.inner.data> resolves to `number[]` and `r.at(0)`
// narrows to the array polyfill. previous 2-segment-only branch bailed at depth 3
declare const obj: { inner: { data: () => number[] } };
type DeepResult = ReturnType<typeof obj.inner.data>;
declare const r: DeepResult;
r.at(0);
