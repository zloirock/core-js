// The b receiver and its outer neighbours all carry effects. Capture the completed object literal
// once so x(), y(), and z() run in source order, then read a, select the method from captured b,
// and read c.
function x() { return 1; }
function y() { return 2; }
function z() { return 3; }

const { a, b: { at }, c } = { a: [x()], b: [y()], c: [z()] };
export const out = [a, c, typeof at];
