import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// removing the entry import must not fuse the next line's unary `+y` onto the previous
// `var x = a` initializer - without an injected `;`, the parser sees `var x = a + y`
// (binary plus chain) instead of two statements. `+` is in ASI_HAZARD_STARTS because
// the spec does NOT auto-insert ASI when the next token can continue the prev expression
// (and binary `+` continues an identifier expression silently). `-` is symmetric and
// covered by the same hazard entry
var x = a;
+y;