// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
{
const { w: { values }, y: { at } } = { w: Object, y: [1] }; [values, at];
}
