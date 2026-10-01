'use strict';
/* eslint-disable es/no-nonstandard-array-prototype-properties, no-extend-native -- a property no engine has is the poison */
// The first of the two isolation controls the driver runs ahead of every cell: it poisons its own
// realm, and passes only if the poison took - so the second, which must not see it, means something.
Array.prototype.e2eLeak = 1;
window.E2E = { run: function () { return { checks: [{ label: 'poisoned', pass: [].e2eLeak === 1 }] }; } };
window.E2E_CELL = { label: 'control/poison', expected: ['poisoned'], timeout: 5000 };
