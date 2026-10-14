// A nested static read through a realm behind an `&&` guard keeps that read once, as written: a falsy
// guard reaches the hop read, which throws where native throws, and a write the selection stores keeps
// the realm's own value. The capture holds the hop and coerces it, and the static extracts behind it - in
// a declaration, beside a rest or a sibling, and in an assignment whose value is discarded or read.
let w, stored, allSettled, sibling;
const o = {};
const { Object: { hasOwn } } = w = m && globalThis;
export const { Number: { isInteger } } = (stored = flag && globalThis);
const { Array: { from, ...arrays } } = guard && globalThis;
const { Math: { trunc }, x } = w = m && self;
({ String: { fromCodePoint: o.chars } } = w = m && globalThis);
export const used = ({ Promise: { allSettled }, y: sibling } = m && globalThis);
export { hasOwn, from, arrays, trunc, x, o, allSettled, sibling, w, stored };
