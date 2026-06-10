// a chain assignment with a GUARDED RHS must not flatten (the destructure read of a falsy
// value keeps its native TypeError) and must not mirror the RHS either - the binding is
// observable and must capture the native value; the leaf default is the sound emission
let w;
let m = 1;
const { Array: { from } } = w = m && globalThis;
from([1]);
