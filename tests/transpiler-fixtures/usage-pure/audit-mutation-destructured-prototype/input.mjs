// destructure SELECTORS pair with their init: a prototype leaf off the constructor, an
// assignment-destructure of the same shape, a positional array-literal slot and a keyed
// object-literal slot all record the prototype mutation - the instance entry pins up front so
// core-js initializes from the pristine prototype before the patch statement runs
const { prototype: P } = Array;
P.at = function () { return 'patched'; };
let Q;
({ prototype: Q } = String);
Q.padStart = function () { return 'patched2'; };
const [R] = [Array.prototype];
R.flatMap = function () { return 'patched3'; };
const { p: S } = { p: String.prototype };
S.includes = function () { return 'patched4'; };
const { n: { d: T } } = { n: { d: Array.prototype } };
T.findLast = function () { return 'patched5'; };
