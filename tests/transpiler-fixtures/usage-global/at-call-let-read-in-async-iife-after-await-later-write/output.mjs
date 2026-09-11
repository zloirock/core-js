import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// an async IIFE suspends at its first `await`: the read after it runs once the array write below
// has happened, so the string init proves nothing and both families inject
let O = 'str';
export const p = (async () => {
  await 0;
  return O.at(0);
})();
O = [1, 2];