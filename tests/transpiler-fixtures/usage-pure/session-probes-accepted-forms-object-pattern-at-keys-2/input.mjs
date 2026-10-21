// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const k = 'k';
function eff() { return Object; }
{
const { w: { at: m, keys: k }, z } = { w: eff(), z: 1 }; use(m, k, z);
}
