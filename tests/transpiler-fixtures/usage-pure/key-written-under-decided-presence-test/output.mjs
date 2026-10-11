import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a write under a presence test the build always answers runs on every path, so the key holds the
// well-known symbol at the read - an `if` and an `&&` alike. an undecided test, a decided-false one
// and the dead arm of a decided one may leave the key unwritten: those reads stay native, as does the
// read behind a test the user opted out of - the build decides nothing there
let key;
if (typeof _Symbol != 'undefined') key = _Symbol$iterator;
export const read = receiver => _getIteratorMethod(receiver);
let andKey;
andKey = _Symbol$iterator;
export const readAnd = receiver => _getIteratorMethod(receiver);
let undecidedKey;
if (flag) undecidedKey = _Symbol$iterator;
export const readUndecided = receiver => receiver[undecidedKey];
let falseKey;
if (typeof _Symbol == 'undefined') falseKey = _Symbol$iterator;
export const readFalse = receiver => receiver[falseKey];
let deadArmKey;
if (typeof _Symbol != 'undefined') {} else deadArmKey = _Symbol$iterator;
export const readDeadArm = receiver => receiver[deadArmKey];
let optedOut;
// core-js-disable-next-line
if (typeof Symbol != 'undefined') optedOut = Symbol.iterator;
export const readOptedOut = receiver => receiver[optedOut];