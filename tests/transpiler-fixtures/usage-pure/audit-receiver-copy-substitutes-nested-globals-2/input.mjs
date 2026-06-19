// receiver-copy global substitution across the remaining SE-free shapes: a binary operand, a computed
// member access (the computed-key global), and a computed property's VALUE - each global must substitute
// in the copied receiver exactly as babel's re-traversed clone does. distinct instance methods per line.
const obj = {};
const { y: { at: a } } = { y: [Set.length + 1] };
const { z: { includes: b } } = { z: [obj[Map]] };
const { w: { flat: c } } = { w: [{ ["k"]: WeakSet }] };
export const r = [a, b, c];
