import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// IIFE wrapping an async generator: the generator body is scanned (the `x = 'hello'` write widens
// the binding's type) and the outer `x.at(0)` still earns its instance polyfill as usual.
let x = [1, 2, 3];
(async function* () {
  x = 'hello';
})();
x.at(0);