// a guard render rewrites the proxy globals inside its own span, so it OWNS them: leaving them
// visible queues a second transform over the same range, and the composition then has to guess
// which occurrence is whose. it guesses by ordinal and lands on whatever spells the same name
// first - a property key, or the inside of a string literal. a shorthand property is the third
// spelling of the collision: its key and value are two nodes over ONE range.
function opaque(o) { return globalThis; }
export const stringKey = opaque({ "self": self })?.window?.Array.of;
export const identKey = opaque({ self: self })?.window?.Array.of;
export const shorthandKey = opaque({ self })?.window?.Array.of;
// NEGATIVE: a key that spells something else was never at risk
export const otherKey = opaque({ k: self })?.window?.Array.of;
// NEGATIVE: two values, no key collision - both substitute
export const twoValues = opaque({ a: self, b: self })?.window?.Array.of;
