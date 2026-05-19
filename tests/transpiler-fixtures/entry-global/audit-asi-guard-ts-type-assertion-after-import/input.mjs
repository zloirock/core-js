// removing the entry import must not fuse the next line's TypeScript TypeAssertion
// `<MyType>raw` onto the previous `var x = 1` expression - without an injected `;`,
// the parser sees `var x = 1 < MyType > raw` (less-than / greater-than chain) and
// rejects the type identifier as a value. guardAsiAtBoundary must treat `<` as a
// hazard char because the prev expression ended without semicolon
var x = 1
import 'core-js/actual/array/from'
<MyType>raw
