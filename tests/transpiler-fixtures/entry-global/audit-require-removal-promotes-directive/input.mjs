// ESM module: when `import 'core-js/X'` is between `"use strict"` and another string
// literal AND modern targets require no polyfill injection, the entry is removed without
// any replacement. without protection, the second literal would slot directly after the
// directive, promoting it to a real directive on re-parse
"use strict";
import 'core-js/actual/array/at';
"use asm";
foo();
