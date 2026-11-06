// Reassignment after a destructuring read cannot change the array value already consumed.
// The literal wrapper and its static from read remain native.
let w = [Array];
const [{ from }] = w;
from([1]);
w = [];
