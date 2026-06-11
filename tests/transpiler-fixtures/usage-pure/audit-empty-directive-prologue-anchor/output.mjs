'';
'use strict';

// an empty-string directive extends the prologue per the spec - injected imports anchor
// AFTER the full prologue so 'use strict' stays an active directive
import _Array$from from "@core-js/pure/actual/array/from";
const from = _Array$from;
from([1]);