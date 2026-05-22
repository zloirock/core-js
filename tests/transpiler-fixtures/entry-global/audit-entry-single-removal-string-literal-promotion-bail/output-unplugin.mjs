// Single entry-import between a directive prologue and a string-literal expression.
// Modern targets emit an empty module set, so the import goes to removal. The next
// sibling is a string-literal expression that is currently NOT a directive (an import
// declaration precedes it). After removal it would land directly after `"use strict"`
// and the engine would re-parse it as a directive. Promotion guard must inject `0;` so
// the prologue stays terminated.
"use strict";
0;
"use asm";
foo();
