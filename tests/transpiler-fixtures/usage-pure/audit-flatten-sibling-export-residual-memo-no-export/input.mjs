// An exported static and a captured instance sibling keep their public bindings.
// Internal receiver temporaries remain private.
export const { Array: { from } } = globalThis, { at, other } = getArr();
from([1]);
console.log(at, other);
