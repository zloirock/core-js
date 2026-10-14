// a static extraction sharing a pattern with a key whose default is an IIFE calling an instance
// method: the method's memo is declared inside the IIFE body, which stays in the residual pattern,
// never beside the extracted declaration.
const { from, x = (function () { return [1].at(0); })() } = Array;
from([1]);
