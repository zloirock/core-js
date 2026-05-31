// an ANNOTATED binding resolves via its declared type, never the value-flow finders where the
// loop-back-edge bail lives - so the in-loop reassignment can't make `x` stale. `x.at()` (Array AND
// String) reflects the whole `number[] | string` union -> the GENERIC instance polyfill, kept
// through the loop. (`.flat()` was array-only and always emitted _flatMaybeArray, masking that `x`
// is a union, not an array.) control vs the unannotated loop-back-edge-*-bails fixtures.
let x: number[] | string = "s" as any;
for (let i = 0; i < 3; i++) {
  x.at(0);
  x = [1, 2, 3];
}
