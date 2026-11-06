import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A for-of head over a bound literal container retains the native from property read.
// The body push call is polyfilled independently.
const out = [];
const W = {
  w: Array
};
for (const {
  w: {
    from
  }
} of [W]) _pushMaybeArray(out).call(out, typeof from);
export { out };