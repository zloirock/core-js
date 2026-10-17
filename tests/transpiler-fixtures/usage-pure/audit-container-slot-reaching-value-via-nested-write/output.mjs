import _Promise from "@core-js/pure/actual/promise";
// a write to a NESTED container bails the deep read as well
const inner = {
  g: Object
};
const host = {
  k: inner
};
inner.g = _Promise;
const {
  k: {
    g: {
      allSettled: viaNestedWrite
    }
  }
} = host;
export { viaNestedWrite };