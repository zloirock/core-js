// removing the entry import must not fuse the next line's unary `-y` onto the previous
// `var x = a` initializer - without an injected `;`, the parser sees `var x = a - y`
// (binary minus chain) instead of two statements. `-` is in ASI_HAZARD_STARTS because
// the spec does NOT auto-insert ASI when the next token can continue the prev expression
// (and binary `-` continues an identifier expression silently). symmetric with the `+`
// hazard already covered by `audit-asi-guard-plus-after-import`
var x = a
import 'core-js/actual/array/from'
-y
