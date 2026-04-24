import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// H03 element-extraction + destructure: IteratorObject<{ nums: number[] }> -> element is
// object with nums: number[]. for-of destructure exposes nums with Array<number> type,
// `.at(0)` routes Array-specific
declare const it: IteratorObject<{ nums: number[] }>;
for (const { nums } of it) _atMaybeArray(nums).call(nums, 0);