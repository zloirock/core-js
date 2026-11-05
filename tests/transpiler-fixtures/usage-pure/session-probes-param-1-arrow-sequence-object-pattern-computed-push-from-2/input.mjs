// An effectful outer key stays before its native from read.
// The push inside that key's helper remains independently polyfilled.
{
const order = []; const eff = t => (order.push(t), t); const { [(eff('k'), 'w')]: { from: f4 } } = { w: Array };
}
