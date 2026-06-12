'use strict';

// modern targets filter the expansion to ZERO modules - bare removal would promote the
// string literal into the prologue, so the `0;` placeholder must survive exactly here
0;
'not-a-directive';
foo();