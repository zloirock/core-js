// `(Symbol as any).iterator in obj` - Symbol wrapped in TSAsExpression. asSymbolRef
// calls unwrapParens to peel TS wrappers (TS_EXPR_WRAPPERS) before checking identifier name.
// Result: Symbol.iterator polyfill should fire
(Symbol as any).iterator in obj;
// chained non-null: Symbol!.iterator
Symbol!.iterator in obj2;
