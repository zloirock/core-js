// Two consecutive entry-imports between a directive prologue and a string-literal expression.
// Modern targets emit an empty module set for each entry; both imports go to removal.
// Original semantics: `"use asm"` is preceded by ImportDeclarations, so the parser treats
// it as a plain ExpressionStatement (not a directive). After batch removal it would land
// directly after `"use strict"` and the engine would promote it to an asm.js directive on
// re-parse - a silent semantic shift the rewrite must not introduce.
"use strict";
import "core-js/actual/array/from";
import "core-js/actual/array/at";
"use asm";
foo();
