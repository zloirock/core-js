'use strict';
'use asm';

import _at from "@core-js/pure/actual/instance/at";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Two prologue directives: `'use strict'` + `'use asm'`.
// imports placed AFTER all prologue directives. body[0] check uses post-prologue index
_Promise$resolve(_at(arr).call(arr, 0));