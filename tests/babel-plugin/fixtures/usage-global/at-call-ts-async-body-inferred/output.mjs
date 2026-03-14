import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
async function fetchItems() {
  return [1, 2, 3];
}
const promise = fetchItems();
promise.at(-1);