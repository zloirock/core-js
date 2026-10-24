// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
export const { C: { groupBy } } = { C: Map } || { C: Object } || { C: Set };
export const settled = ({ C: Promise } || { C: Array } || { C: Number }).C.allSettled;
