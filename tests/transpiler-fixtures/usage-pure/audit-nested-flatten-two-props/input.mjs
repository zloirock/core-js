// Nested proxy-global destructure with two polyfillable keys on the inner pattern.
// Each prop gets an independent extracted declaration; the outer declaration's inner
// pattern should shrink one prop at a time, and the final extraction should collapse
// the whole `const { Array: {} } = globalThis` shape away
const { Array: { from: f, of: o } } = globalThis;
const result = f([1]).concat(o(2));
export { result };
