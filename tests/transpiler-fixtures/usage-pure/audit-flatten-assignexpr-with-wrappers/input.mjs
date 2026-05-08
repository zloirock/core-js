// `({ Array: { from } = {} } = globalThis)` is a wrapped destructure-assignment, not a declarator.
// Cascade flatten must track the outermost wrapper as LHS so the polyfill alias survives the wrapper layer.
let from;
let of;
({ Array: { from } = {} } = globalThis);
({ Array: { of } = {} } = globalThis);
from('hi');
of(1, 2);
