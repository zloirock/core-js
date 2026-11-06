import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.function.name";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An iteration whose elements cannot be paired does not itself release their constructors.
// Unused heads, intrinsic properties and local aliases require no Map static namespace.
async function awaited() {
  for await (const value of [Map]) {
    const alias = value;
    void alias.name;
  }
}
function spread() {
  for (const value of [...[Map]]) void value.name;
}
function sparse() {
  for (const value of [, Map]) void value;
}
function named() {
  const values = [Map];
  for (const value of values) {}
}