// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const k = 'k';
function eff() { return Object; }
{
const { w: { at: m }, z } = { w: eff(), z: 1 }; const { w: { keys: k }, q } = { w: eff(), q: 1 }; use(m, z, k, q);
}
