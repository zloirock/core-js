// An effect inside a proxy member runs once before any binding. The captured receiver
// keeps the extracted static before its following native sibling.
const { from, custom } = (eff(), globalThis).self.Array;
from([1]);
custom();
