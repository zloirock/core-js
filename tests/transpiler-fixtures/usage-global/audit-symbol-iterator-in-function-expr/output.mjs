import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `Symbol.iterator in <FunctionExpression>` - functions don't carry iterator at runtime,
// but plugin treats `Symbol.iterator in <RHS>` as polyfill trigger regardless of RHS shape.
// covers the FunctionExpression-as-RHS case; full iterator polyfill suite registered
// (es.symbol.iterator, es.array.iterator, es.string.iterator, web.dom-collections.iterator)
Symbol.iterator in function () {};