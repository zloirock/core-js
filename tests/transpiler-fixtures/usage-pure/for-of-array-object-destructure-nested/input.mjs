// for-of with array-outer / object-inner destructure: `[{ key }]` binds against each
// element of `{ key: string[] }[]`. Top-level findPatternIndex skips ObjectPattern
// elements, so the nested-pattern descent must walk the same annotation via the
// key-path classifier - regression returns generic `_at` rather than the array variant.
// Symmetric with the object-outer / array-inner case (`for (const { arr: [x] } of ...)`).
declare const entries: { key: string[] }[][];
for (const [{ key }] of entries) {
  key.at(-1);
}
