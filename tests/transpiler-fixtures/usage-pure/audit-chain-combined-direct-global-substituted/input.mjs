// chain-combined OR-emit references the receiver text in multiple template slots
// (`null == X`, `null == (_ref = inner(X))`, `_ref.call(X, ...)`). a bare proxy-global receiver
// (`globalThis.flat?.()`) must be resolved to its polyfill binding BEFORE template construction,
// else only the AST-anchored occurrence is patched and the duplicated text strands raw `globalThis`
globalThis.flat?.().includes(1);
