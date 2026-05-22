// Two consecutive entries followed by two string-literal expressions. Modern targets emit
// an empty module set for both entries. Right-to-left simulation decides the last entry's
// fate first: with the earlier entry still pending-removal, the next surviving sibling is
// the first string-literal expression, so it promotes to `0;`. The earlier entry then sees
// the later entry's ImportDeclaration as its surviving next sibling and gets removed.
// Result: one `0;` placeholder between the prologue and the first string-literal blocks
// promotion for both bogus directives.
"use strict";
0;
"use bogus";
"use other";
foo();
