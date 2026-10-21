// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const arr = [1, [2]];
const { x: { from: f }, y: { flat: m } } = { x: Array, y: arr };
