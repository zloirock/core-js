// Computed member targets take statics without moving target evaluation ahead of siblings.
// A sole chain extracts in place; a shared pattern mirrors its receiver and keeps target order.
// Nested instance targets remain native where an overwrite would re-read the receiver after the key.
let o;
({ [(e(), 'from')]: sink[k()] } = Array);
({ Object: { [(e(), 'fromEntries')]: sink[k2()] } } = globalThis);
({ Map: { [(e(), 'groupBy')]: sink[k3()] } } = globalThis);
({ y: { at: sink[k4()] } } = { y: arr });
({ entries: sink[k5()], values: o } = Object);
