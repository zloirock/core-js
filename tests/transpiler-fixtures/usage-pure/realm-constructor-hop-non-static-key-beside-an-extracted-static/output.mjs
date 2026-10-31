import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const user = {};
const {
  k: {
    Map: {
      groupBy: g,
      0: z
    }
  } = c ? _globalThis : user
} = {
  k: _globalThis
};
export { g, z };