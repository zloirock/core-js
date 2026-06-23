import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// removing the entry import must not fuse the next line's unary `-y` onto the previous
// `var x = a` initializer - without an injected `;`, the parser sees `var x = a - y`
// (binary minus chain) instead of two statements. leading `-` is an ASI hazard: the
// spec does not insert ASI when the next token can continue the expression. `+` mirrors
var x = a
;-y