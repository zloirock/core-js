// chain-combined OR-emit references the receiver text in multiple template slots
// (`null == X`, `null == (_ref = inner(X))`, `_ref.call(X, ...)`). a bare proxy-global
// receiver (`globalThis.flat?.()`) must be resolved to its polyfill binding BEFORE
// template construction - otherwise visitor-driven Identifier substitution patches only
// the AST-anchored occurrence and the duplicated text occurrences strand raw `globalThis`
// in the output
globalThis.flat?.().includes(1);
