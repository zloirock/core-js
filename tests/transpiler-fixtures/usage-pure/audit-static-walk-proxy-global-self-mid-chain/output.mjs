import _self from "@core-js/pure/actual/self";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const ns = {
  root: _self
};
const {
  root: {
    Map: {
      groupBy
    }
  }
} = ns;
export const grouped = groupBy([1, 2, 3], n => n % 2);