// a key whose every value is the iterator symbol or its `'@@iterator'` fallback reads the iterator
// method, which answers either one: written in both arms of an undecided test, or by a decided test
// ahead of a closure that a later fallback write may reach once it is called again
let eitherArm;
if (flag) eitherArm = '@@iterator';
else eitherArm = Symbol.iterator;
export const readEitherArm = receiver => receiver[eitherArm];
let laterFallback;
if (typeof Symbol != 'undefined') laterFallback = Symbol.iterator;
export const readBeforeLaterFallback = receiver => receiver[laterFallback];
if (flag) laterFallback = '@@iterator';
