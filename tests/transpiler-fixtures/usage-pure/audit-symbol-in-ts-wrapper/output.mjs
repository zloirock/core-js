import _isIterable from "@core-js/pure/actual/is-iterable";
// `(Symbol as any).iterator in obj` - Symbol wrapped in TSAsExpression. asSymbolRef
// calls unwrapParens to peel TS wrappers (TS_EXPR_WRAPPERS) before checking identifier name.
// Result: Symbol.iterator polyfill should fire
_isIterable(obj);
// chained non-null: Symbol!.iterator
_isIterable(obj2);