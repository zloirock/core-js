import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `IteratorObject<{ nums: number[] }>` - each element is an object with `nums: number[]`.
// for-of destructure binds `nums` to `number[]`, so `.at(0)` on it routes to the
// array-specific instance polyfill through the inner type propagation
declare const it: IteratorObject<{
  nums: number[];
}>;
for (const {
  nums
} of it) _atMaybeArray(nums).call(nums, 0);