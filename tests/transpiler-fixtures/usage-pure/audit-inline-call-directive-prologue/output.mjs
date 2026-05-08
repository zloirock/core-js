import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
// `'use strict'` directive prologue inside the inline-callee body must not block static dispatch.
// Babel parses it outside the body so inline lifts cleanly; ESTree parses it as a prefix expression statement.
// Both shapes still emit the polyfill while leaving the directive-bearing declaration in place.
const strictReturn = function () {
  'use strict';

  return _Promise;
};
const result1 = _Promise$resolve(1);
const strictReturnArrow = () => {
  'use strict';

  return _Promise;
};
const result2 = _Promise$reject(2);
export { result1, result2 };