// Single entry-import between a directive prologue and a string-literal expression.
// Modern targets emit an empty module set, so the import goes to removal. the string-literal
// is currently NOT a directive (an import precedes it); after removal it would land after
// `"use strict"` and re-parse as one, so a `0;` placeholder must keep the prologue terminated.
"use strict";
import "core-js/actual/array/from";
"use asm";
foo();
