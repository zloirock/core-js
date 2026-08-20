import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// TypeScript `private` modifier on a class field still uses PropertyDefinition with a
// typeAnnotation slot. visitor must walk that annotation regardless of accessibility
// modifier - the polyfill emission gate is independent of public / private / protected
class Store {
  private data: Map<string, number> = new Map();
  read(key: string) {
    return this.data.get(key);
  }
}
new Store();