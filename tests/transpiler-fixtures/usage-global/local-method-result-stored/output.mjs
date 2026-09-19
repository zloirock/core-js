import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Storing a fixed local method result does not lose its constructor identity.
// The call stays in the initializer; reading the static does not require the full family.
const source = {
  read() {
    return Map;
  }
};
const Constructor = source.read();
export const method = Constructor.groupBy;