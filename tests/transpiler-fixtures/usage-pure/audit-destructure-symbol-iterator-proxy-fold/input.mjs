// `iterator` destructured off a proxy-global Symbol (`globalThis.Symbol`) resolves to Symbol.iterator
// exactly like the bare-constructor form, so the computed read folds to `_getIteratorMethod`. both
// emitters now resolve the alias identically - previously only the AST substrate folded this (its
// early pattern-flatten), the text substrate kept it raw
const { iterator } = globalThis.Symbol;
['a', 'b'][iterator];
