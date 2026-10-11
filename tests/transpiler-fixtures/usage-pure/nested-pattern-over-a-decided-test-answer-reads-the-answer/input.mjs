// a nested pattern over a selection the build decides to its test's own answer - an `&&` whose test
// fails, a `||` / `??` whose test holds - reads off that answer, natively a TypeError: the operand it
// skips names no static, at any depth, beside a sibling, under an array level or off the realm. a test
// that runs the `&&` right leaves the pattern reading that right
export const { C: { groupBy } } = typeof Symbol == 'undefined' && { C: Map };
const { A: { B: { isInteger } } } = typeof Symbol == 'undefined' && { A: { B: Number } };
let { C: { allSettled }, D } = typeof Symbol == 'undefined' && { C: Promise, D: 1 };
export const { C: [{ fromEntries }] } = typeof Symbol == 'undefined' && { C: [Object] };
export const { Reflect: { ownKeys } } = typeof Symbol != 'undefined' || globalThis;
export const { C: { raw } } = typeof Symbol != 'undefined' ?? { C: String };
export const { C: { trunc } } = typeof Symbol != 'undefined' && { C: Math };
export { isInteger, allSettled, D };
