'';
'use strict';
// an empty-string directive extends the prologue per the spec - injected imports anchor
// AFTER the full prologue so 'use strict' stays an active directive
const { from } = Array;
from([1]);
