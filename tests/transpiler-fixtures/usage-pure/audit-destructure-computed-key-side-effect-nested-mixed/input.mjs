// Static and instance claims in nested sibling branches retain their source order.
// Each effectful key runs before its own from or flat binding is initialized.
const arr = [1, [2]];
const { x: { [(before(), 'from')]: f }, y: { [(after(), 'flat')]: m } } = { x: Array, y: arr };
