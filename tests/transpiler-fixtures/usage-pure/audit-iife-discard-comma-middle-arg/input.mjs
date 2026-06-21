// IIFE with destructured param at non-zero position: `((a, {from}, c) => from(...))(X, Array, Y)`.
// receiver substitution must match the destructured param to its positional call argument
// (the second one here) and rewrite that argument, not the first
const r = ((_a, { from }, _c) => from([1, 2, 3]))(0, Array, 1);
export { r };
