// A nested static declarator shares a declaration with two instance destructures.
// All three claims keep their own receivers and source order.
const { at } = getArr(), { flat } = getArr2(), { Array: { from } } = globalThis;
at;
flat;
from([1]);
