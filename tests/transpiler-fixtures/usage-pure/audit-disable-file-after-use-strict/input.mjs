// file-level disable directive `/* core-js disable */` placed after `'use strict'`:
// the directive must still be honoured for the whole file.
'use strict';
// core-js-disable-file
// `'use strict'` directive precedes the disable directive; cutoff must skip it so
// the disable-file still takes effect
Array.from(x);
