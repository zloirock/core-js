import _Map from "@core-js/pure/actual/map";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
let rw1 = {
  k: Object
};
rw1 = {
  k: _Map
};
const {
  k: {
    groupBy: viaDominating
  }
} = rw1;
export { viaDominating };