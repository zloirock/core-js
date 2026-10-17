// Nested static and instance leaves in sibling branches both receive pure bindings. A fresh literal
// host and its pristine Array values may be retained or captured without observable effects. The
// ordinary receiver and both source bindings remain intact.
const arr = [1, [2]];
const { x: { from: f }, y: { flat: m } } = { x: Array, y: arr };
