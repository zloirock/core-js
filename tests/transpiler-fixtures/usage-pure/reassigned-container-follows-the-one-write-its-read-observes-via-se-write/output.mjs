import _Promise from "@core-js/pure/actual/promise";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
let effCount = 0;
const eff9 = () => effCount++;
let rw9 = {
  d: Object
};
rw9 = (eff9(), {
  d: _Promise
});
const {
  d: {
    allSettled: viaSeWrite
  }
} = rw9;
export { viaSeWrite };