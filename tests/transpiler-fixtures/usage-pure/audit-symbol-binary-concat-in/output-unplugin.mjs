// `('Symbol.' + 'iterator') in obj` — `resolveKey` folds the `+` to the string
// `'Symbol.iterator'`, but `isSymbolSourcedKey` rejects BinaryExpression sources —
// it's a string concat, not a symbol reference. `obj` is unresolved anyway, so
// neither branch emits a polyfill
('Symbol.' + 'iterator') in obj;