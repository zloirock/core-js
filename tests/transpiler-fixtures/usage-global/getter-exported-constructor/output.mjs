import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Exporting a destructured constructor carries its static methods to the importer.
// Getter effects stay in place; export-declaration and export-specifier forms agree.
const source = {
  get realm() {
    mark();
    return globalThis;
  }
};
export const {
  realm: {
    Map: Value
  }
} = source;