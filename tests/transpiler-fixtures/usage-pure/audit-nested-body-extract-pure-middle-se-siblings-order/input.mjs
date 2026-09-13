// The claimed b.at leaf sits between outer siblings a and c. Capture the completed object literal
// once, then read a, select the method from the captured b value, and read c in source property
// order.
function x() { return 1; }
function z() { return 3; }

const { a, b: { at }, c } = { a: [x()], b: [1, 2, 3], c: [z()] };
at();
export const out = [a, c];
