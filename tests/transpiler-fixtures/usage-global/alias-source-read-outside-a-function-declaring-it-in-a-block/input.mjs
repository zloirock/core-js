// an alias reads its source where it is declared, so a `var` of the same name in a block of a function the
// use stands in - hoisted to that function, not to the alias - does not shadow that read: the alias still
// holds the global, read directly, in a closure or as a destructure source
const B = Array;
export function direct(c) { if (c) { var Array = 1; } return B.from(xs); }
const P = Promise;
export function closure(c) { if (c) { var Promise = 1; } return () => P.resolve(1); }
const I = Iterator;
export function destructured(c) { if (c) { var Iterator = 1; } const { from } = I; return from(xs); }
