// A decided test can yield a boolean instead of its constructor-containing operand.
// The native pattern must read that actual value, preserving its failure or absent property.
export const { C: { groupBy } } = typeof Symbol == 'undefined' && { C: Map };
const { A: { B: { isInteger } } } = typeof Symbol == 'undefined' && { A: { B: Number } };
let { C: { allSettled }, D } = typeof Symbol == 'undefined' && { C: Promise, D: 1 };
export const { C: [{ fromEntries }] } = typeof Symbol == 'undefined' && { C: [Object] };
export const { Reflect: { ownKeys } } = typeof Symbol != 'undefined' || globalThis;
export const { C: { raw } } = typeof Symbol != 'undefined' ?? { C: String };
export const { C: { trunc } } = typeof Symbol != 'undefined' && { C: Math };
export { isInteger, allSettled, D };
