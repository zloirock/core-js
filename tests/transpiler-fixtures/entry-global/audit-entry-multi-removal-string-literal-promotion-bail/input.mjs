// Two consecutive entry-imports between a directive prologue and a SINGLE trailing string-literal.
// both emit an empty module set under esmodules:true, so both go to removal. `"use asm"` is now a
// plain ExpressionStatement (imports precede it); after removal it would land after `"use strict"`
// and re-parse as an asm.js directive - a silent shift the rewrite must block with a `0;` placeholder.
"use strict";
import "core-js/actual/array/from";
import "core-js/actual/array/copy-within";
"use asm";
foo();
