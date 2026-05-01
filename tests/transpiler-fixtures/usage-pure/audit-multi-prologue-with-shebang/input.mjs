'use strict';
'use asm';
// triple-directive prologue: `'use strict'` + `'use asm'`. ESM-mode files cannot host
// shebangs (loader handles that), but multi-directive prologue passthrough still applies.
// imports placed AFTER all prologue directives. body[0] check uses post-prologue index
Promise.resolve(arr.at(0));
