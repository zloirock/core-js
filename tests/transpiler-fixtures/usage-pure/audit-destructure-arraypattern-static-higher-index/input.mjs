// A static at a later array index pairs with that exact source element.
// Earlier element bindings retain their original values.
const [a, b, { from }] = [1, 2, Array];
from([a, b]);
