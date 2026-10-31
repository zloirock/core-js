import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// global type reference nested in a TSTupleType element: tuple members live in `elementTypes`
// (plural), distinct from TSArrayType's singular `elementType` - both must be walked so Map
// here is detected the same as in any other annotation position
let entries: [Map<string, number>, string];