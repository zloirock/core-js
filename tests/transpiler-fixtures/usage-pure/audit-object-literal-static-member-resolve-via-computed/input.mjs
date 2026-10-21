// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.

const withComputed = { N: Array, ["N"]: Promise };
const { N: { allSettled } } = withComputed;
export const viaComputed = allSettled([]);
