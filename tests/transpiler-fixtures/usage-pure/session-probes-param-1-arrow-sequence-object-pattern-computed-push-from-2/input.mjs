// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims. Instance claims retain their own receivers.
{
const order = []; const eff = t => (order.push(t), t); const { [(eff('k'), 'w')]: { from: f4 } } = { w: Array };
}
