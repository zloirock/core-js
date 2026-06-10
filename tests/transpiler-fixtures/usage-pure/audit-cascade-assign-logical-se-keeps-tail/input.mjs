// an ASSIGNMENT-form host with an effectful logical RHS: the cascade keeps the whole RHS as
// a statement (the effect and the reads run exactly as native) and binds the polyfill after -
// the cascade KEEPS the tail, so the effectful logical does not bail it
let from;
let c = 0;
let m = 1;
({ Array: { from } } = (c++, m) && globalThis);
from([1]);
