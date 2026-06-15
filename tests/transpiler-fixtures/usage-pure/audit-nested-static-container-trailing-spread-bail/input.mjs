// A trailing spread in a static-container object literal could inject or override the resolved key,
// so a destructure that reaches a global static through it must NOT receiver-less-substitute the
// static - the binding stays native. without the bail, `from` would wrongly bind `_Array$from` even
// though the spread might redefine the inner `Array` container.
declare const o: Record<string, any>;
const { root: { Array: { from } } } = { root: { Array, ...o } };
from([1]);
