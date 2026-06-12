'use strict';
// modern targets filter the expansion to ZERO modules - bare removal would promote the
// string literal into the prologue, so the `0;` placeholder must survive exactly here
require('core-js/actual/array/from');
'not-a-directive';
foo();
