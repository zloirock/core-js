// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
function eff() { return Object; }
{
const { a: { [(eff('k'), 'Array')]: { from: f14 } } } = { a: globalThis };
}
