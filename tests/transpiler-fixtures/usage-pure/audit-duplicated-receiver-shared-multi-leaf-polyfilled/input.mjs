// Two instance methods share a nested array containing a polyfillable constructor. Capture the
// outer object once, preserve the constructor substitution inside it, then select both instance
// methods from the same nested receiver before reading the outer sibling.
const { y: { at: a, includes: b }, k } = { y: [Promise], k: 1 };
export const r = [a, b, k];
