// Assignment receivers preserve call effects while serving the pure static.
// A collapsible realm selection needs no runtime choice of the method.
let from;
let of;
let c = true;
({ Array: { from } } = globalThis || self);
({ Array: { of } } = (() => (c ? globalThis : self))());
from([1]);
of(2);
