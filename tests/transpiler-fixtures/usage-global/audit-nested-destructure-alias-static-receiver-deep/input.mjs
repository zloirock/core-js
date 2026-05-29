// the static-receiver walk descends an arbitrarily deep nested destructure binding (three
// levels here) to recover the source key path of the aliased constructor
const { outer: { mid: { Array: Arr } } } = { outer: { mid: globalThis } };
const { a: { from } } = { a: Arr };
from([1, 2, 3]);
