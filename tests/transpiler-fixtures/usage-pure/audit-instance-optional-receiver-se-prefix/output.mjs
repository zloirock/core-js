import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// optional-chain instance dispatch on SequenceExpression-receiver: `(fn(), arr)?.at(-1)`
// native semantics evaluate `fn()` BEFORE the nullish check (always once), then short-
// circuit on nullish or call `.at` on the resolved value. The prefix runs once in the
// guard; the stable receiver can be reused without capturing the whole sequence.
let calls = 0;
const fn = () => {
  calls++;
};
const arr = [1, 2, 3];
const result = null == (fn(), arr) ? void 0 : _atMaybeArray(arr).call(arr, -1);
export { calls, result };