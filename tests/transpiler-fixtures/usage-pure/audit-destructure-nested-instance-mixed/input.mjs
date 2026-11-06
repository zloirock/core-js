// A literal host keeps its static Array.from read and captures the instance flat receiver.
// The two sibling branches retain their original source bindings and order.
const arr = [1, [2]];
const { x: { from: f }, y: { flat: m } } = { x: Array, y: arr };
