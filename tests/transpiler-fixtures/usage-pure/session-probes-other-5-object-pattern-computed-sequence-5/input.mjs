// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live.
function eff() { return Object; }
{
const { [(eff('k'), 'w')]: { [(eff('k2'), 'from')]: f } } = { w: Array };
}
