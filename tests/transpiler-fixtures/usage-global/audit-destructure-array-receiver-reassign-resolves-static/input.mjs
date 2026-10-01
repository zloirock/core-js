// nested array-wrapper destructure `const [{ from }] = w` where `w` is reassigned AFTER the
// destructure - at the destructure w[0] is Array, so `from` is Array.from and usage-global must
// inject es.array.from. the const-init-follow walk is now method-aware; usage-pure bails.
let w = [Array];
const [{ from }] = w;
from([1, 2, 3]);
w = [];
