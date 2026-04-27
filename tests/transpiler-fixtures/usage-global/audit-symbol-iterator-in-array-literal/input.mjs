// `Symbol.iterator in [1,2,3]` directly on array literal. RHS array literal carries the
// same iterator-receiver semantics as named array bindings - plugin emits the full
// iterator polyfill suite (es.symbol.iterator, es.array.iterator, etc.) regardless of RHS
// shape. covers the array-literal-as-RHS case
Symbol.iterator in [1, 2, 3];
