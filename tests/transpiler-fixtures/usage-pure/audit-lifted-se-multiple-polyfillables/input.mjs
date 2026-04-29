// SE prefix with multiple polyfillable references: `(new Set(arr), new Map(), globalThis)`.
// each inner reference (`Set`, `Map`) needs its own polyfill emission - the lift mechanism
// preserves the SE expressions and natural visitor pass picks up each global usage
const arr = [1, 2];
const { Array: { from } } = (new Set(arr), new Map(), globalThis);
export { from };
