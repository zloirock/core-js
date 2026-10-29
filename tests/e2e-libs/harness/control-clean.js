'use strict';
/* eslint-disable es/no-nonstandard-array-prototype-properties -- reads the first control's poison */
// The second isolation control: a realm of its own must not carry the poison the first one left in
// its. Red here voids every verdict of the run - the cells' frames would be sharing one realm.
window.E2E = { run: function () { return { checks: [{ label: 'isolated', pass: [].e2eLeak === undefined }] }; } };
window.E2E_CELL = { label: 'control/clean', expected: ['isolated'], timeout: 5000 };
