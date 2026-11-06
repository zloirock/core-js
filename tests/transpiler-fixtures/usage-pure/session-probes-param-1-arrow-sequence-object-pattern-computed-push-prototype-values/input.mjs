{
// The computed outer key runs before the nested prototype read and instance-method extraction.
const order = []; const eff = t => (order.push(t), t); const { [(eff('k'), 'Array')]: { prototype: { values: f2 } } } = globalThis;
}
