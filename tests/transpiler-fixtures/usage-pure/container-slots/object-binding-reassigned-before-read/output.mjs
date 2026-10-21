import _Map from "@core-js/pure/actual/map";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const containerWhollyReassigned = function () {
  let swapped = {
    k: Object
  };
  swapped = {
    k: _Map
  };
  const {
    k: {
      groupBy
    }
  } = swapped;
  return groupBy;
}();
export { containerWhollyReassigned };