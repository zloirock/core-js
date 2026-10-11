// a write under a presence test the build always answers runs on every path, so the key holds the
// well-known symbol at the read - an `if` and an `&&` alike. an undecided test, a decided-false one
// and the dead arm of a decided one may leave the key unwritten: those reads stay native, as does the
// read behind a test the user opted out of - the build decides nothing there
let key;
if (typeof Symbol != 'undefined') key = Symbol.iterator;
export const read = receiver => receiver[key];
let andKey;
typeof Symbol != 'undefined' && (andKey = Symbol.iterator);
export const readAnd = receiver => receiver[andKey];
let undecidedKey;
if (flag) undecidedKey = Symbol.iterator;
export const readUndecided = receiver => receiver[undecidedKey];
let falseKey;
if (typeof Symbol == 'undefined') falseKey = Symbol.iterator;
export const readFalse = receiver => receiver[falseKey];
let deadArmKey;
if (typeof Symbol != 'undefined') {} else deadArmKey = Symbol.iterator;
export const readDeadArm = receiver => receiver[deadArmKey];
let optedOut;
// core-js-disable-next-line
if (typeof Symbol != 'undefined') optedOut = Symbol.iterator;
export const readOptedOut = receiver => receiver[optedOut];
