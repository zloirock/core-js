// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const configObjectIsNoContainer = (function () {
  const config = { handler() { return 1; }, limit: 5 };
  JSON.stringify(config);
  const neighbour = { k: Object };
  const { k: { keys } } = neighbour;
  return keys;
})();
export { configObjectIsNoContainer };
