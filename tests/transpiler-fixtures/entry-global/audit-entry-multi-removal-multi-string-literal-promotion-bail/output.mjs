// Two consecutive entries followed by two string-literal expressions; modern targets emit
// an empty module set for both, so both go to removal. removing them would let the first
// string-literal land after `"use strict"` and re-parse as a directive. one `0;` placeholder
// between the prologue and the first string-literal blocks promotion for both bogus directives.
"use strict";

0;
"use bogus";
"use other";
foo();