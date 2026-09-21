// A nested static with a sequence initializer preserves its prefix once.
// The effect runs before the binding receives the pure method.
function se() { return globalThis; }
const { Array: { from } } = (se(), globalThis);
from([1, 2]);
