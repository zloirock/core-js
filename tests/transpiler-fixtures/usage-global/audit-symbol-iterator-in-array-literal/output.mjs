import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `Symbol.iterator in [1,2,3]` directly on array literal. RHS array literal carries the
// same iterator-receiver semantics as named array bindings - plugin emits the full
// iterator polyfill suite (es.symbol.iterator, es.array.iterator, etc.) regardless of RHS
// shape. covers the array-literal-as-RHS case
Symbol.iterator in [1, 2, 3];