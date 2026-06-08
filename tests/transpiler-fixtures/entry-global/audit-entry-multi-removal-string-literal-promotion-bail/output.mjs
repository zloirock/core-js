// Two consecutive entry-imports between a directive prologue and a SINGLE trailing string-literal
// expression. array/from and array/copy-within both emit an empty module set under esmodules:true
// (Safari 10.1 baseline ships both), so both imports go to removal - unlike array/at, which would
// inject its polyfill module and survive. Original semantics: `"use asm"` is preceded by ImportDeclarations,
// so the parser treats it as a plain ExpressionStatement (not a directive). After batch removal it
// would land directly after `"use strict"` and the engine would promote it to an asm.js directive on
// re-parse - a silent semantic shift the rewrite must not introduce. The multi-string-literal variant
// (one 0; blocking several bogus directives) is covered by the sibling -multi-string-literal- fixture
"use strict";

0;
"use asm";
foo();