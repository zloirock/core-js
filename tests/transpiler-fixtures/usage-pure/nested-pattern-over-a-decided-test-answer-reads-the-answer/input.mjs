// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
export const { C: { groupBy } } = typeof Symbol == 'undefined' && { C: Map };
const { A: { B: { isInteger } } } = typeof Symbol == 'undefined' && { A: { B: Number } };
let { C: { allSettled }, D } = typeof Symbol == 'undefined' && { C: Promise, D: 1 };
export const { C: [{ fromEntries }] } = typeof Symbol == 'undefined' && { C: [Object] };
export const { Reflect: { ownKeys } } = typeof Symbol != 'undefined' || globalThis;
export const { C: { raw } } = typeof Symbol != 'undefined' ?? { C: String };
export const { C: { trunc } } = typeof Symbol != 'undefined' && { C: Math };
export { isInteger, allSettled, D };
