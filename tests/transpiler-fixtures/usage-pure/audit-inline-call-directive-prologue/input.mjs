// `'use strict'` directive prologue inside the inline-callee body must not block static dispatch.
// Babel parses it outside the body so inline lifts cleanly; ESTree parses it as a prefix expression statement.
// Both shapes still emit the polyfill while leaving the directive-bearing declaration in place.
const strictReturn = function () {
  'use strict';
  return Promise;
};
const result1 = strictReturn().resolve(1);
const strictReturnArrow = () => {
  'use strict';
  return Promise;
};
const result2 = strictReturnArrow().reject(2);
export { result1, result2 };
