import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
let x = [];
(async () => {
  x = "hello";
})();
x.at(-1);