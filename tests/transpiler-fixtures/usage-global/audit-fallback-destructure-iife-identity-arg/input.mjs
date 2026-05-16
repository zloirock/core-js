// identity IIFE: `(arg => arg)(Array)` is a pass-through wrapper that returns its
// argument verbatim. `peelZeroArgIifeReturn` recognises the identity pattern (body is
// an Identifier matching one of the params) and lifts the corresponding arg as the
// inline value -- so `Result` resolves to `Array`, the destructured `from` becomes
// `Array.from`, and `es.array.from` polyfill is emitted. complements the zero-arg IIFE
// peel by handling factory wrappers that thread their argument through.
const Result = (arg => arg)(Array);
const { from } = Result;
from([1, 2]);
