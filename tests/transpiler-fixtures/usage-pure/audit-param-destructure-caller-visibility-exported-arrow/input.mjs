// Rewriting a parameter destructure is caller-lossy: a body-extract ignores what the caller passed, and an inline default fills a
// leaf the caller deliberately left undefined.
const G = globalThis;
export const exportedArrow = ([{ Promise, Array: { from } } = G]) => [Promise, from];
