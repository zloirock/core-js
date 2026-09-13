// The parameter is replaced before its first read, so the result is otherFn()'s value.
// The original Array argument supplies neither the receiver nor a constructor-family obligation.
const Result = (arg => { arg = otherFn(); return arg; })(Array);
const { from } = Result;
from([1, 2]);
