// an ALL-PROXY fallback receiver (every branch a global proxy) is wholly discardable, so the
// flatten owns the `[Symbol.iterator]` extraction (bound to the collapsed operand); a
// surviving rest residual keeps the BRANCHING read - the ternary stays in the init with its
// operands polyfilled, matching the per-branch semantics of the untouched pattern
const { [Symbol.iterator]: it, ...r } = c ? globalThis : self;
it;
r;
const { [Symbol.iterator]: it2, Array: { from: f } } = c ? globalThis : self;
it2;
f(x);
