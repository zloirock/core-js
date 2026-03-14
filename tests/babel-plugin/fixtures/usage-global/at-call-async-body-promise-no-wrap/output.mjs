import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
async function fetchData() {
  return Promise.resolve([1, 2, 3]);
}
async function main() {
  const items = await fetchData();
  items.at(-1);
}