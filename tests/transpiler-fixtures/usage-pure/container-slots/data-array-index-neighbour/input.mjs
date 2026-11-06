// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
const varIndexOnDataArray = (function () {
  const dataArr = [1, 2, 3];
  const dataIdx = 1;
  const untouchedNeighbour = { k: Object };
  const { k: { entries } } = untouchedNeighbour;
  return [dataArr[dataIdx], entries];
})();
export { varIndexOnDataArray };
