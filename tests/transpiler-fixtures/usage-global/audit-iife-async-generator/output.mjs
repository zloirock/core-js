import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// IIFE wrapping an async generator: the generator body is scanned and runtime calls
// inside it (e.g. `yield Map.x`) are rewritten as usual.
let x = [1, 2, 3];
(async function* () {
  x = 'hello';
})();
x.at(0);