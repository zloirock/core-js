// Outer and inner effectful keys run in order before the served from binding initializes.
function eff() { return Object; }
{
const { [(eff('k'), 'w')]: { [(eff('k2'), 'from')]: f } } = { w: Array };
}
