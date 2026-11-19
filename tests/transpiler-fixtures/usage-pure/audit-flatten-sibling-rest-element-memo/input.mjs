// A static declaration and a rest-bearing instance sibling keep their evaluation order.
// The instance slot remains native because its level copies object rest.
const { Array: { from } } = globalThis, { at, ...rest } = getArr();
from([1]);
console.log(at, rest);
