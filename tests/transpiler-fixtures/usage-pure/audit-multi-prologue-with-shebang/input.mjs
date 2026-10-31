'use strict';
'use asm';
// Two prologue directives: `'use strict'` + `'use asm'`.
// imports placed AFTER all prologue directives. body[0] check uses post-prologue index
Promise.resolve(arr.at(0));
