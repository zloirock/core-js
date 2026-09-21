// A container reassigned after a nested destructure still supplies its earlier captured constructor.
// The static read at that earlier site receives the pure method.
let w = { Arr: Array };
const { Arr: { from } } = w;
from([1, 2, 3]);
w = {};
