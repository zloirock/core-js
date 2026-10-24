import _Iterator from "@core-js/pure/actual/iterator";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const clean = {
  S: _Iterator
};
const {
  S: {
    from
  }
} = clean;
export const viaClean = from([3, 4]);