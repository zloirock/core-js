// nested object-destructure `const { Arr: { from } } = w` where the wrapper `w` is reassigned AFTER
// the destructure - at the destructure w.Arr is Array, so `from` is Array.from and usage-global must
// inject es.array.from. the static-receiver walk is now method-aware; usage-pure bails.
let w = { Arr: Array };
const { Arr: { from } } = w;
from([1, 2, 3]);
w = {};
