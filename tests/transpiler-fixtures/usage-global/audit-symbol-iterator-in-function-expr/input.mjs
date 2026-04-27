// `Symbol.iterator in <FunctionExpression>` - functions don't carry iterator at runtime,
// but plugin treats `Symbol.iterator in <RHS>` as polyfill trigger regardless of RHS shape.
// covers the FunctionExpression-as-RHS case; full iterator polyfill suite registered
// (es.symbol.iterator, es.array.iterator, es.string.iterator, web.dom-collections.iterator)
Symbol.iterator in function () {};
