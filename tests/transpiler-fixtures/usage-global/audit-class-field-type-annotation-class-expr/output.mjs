import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// class EXPRESSION (not declaration) carries the same body / PropertyDefinition shape.
// visitor entries must hit the field typeAnnotation on ClassExpression too, otherwise the
// Map polyfill is dropped when the class is bound to a const instead of a class statement
const C = class {
  bag: Map<string, number> = new Map();
};
new C();