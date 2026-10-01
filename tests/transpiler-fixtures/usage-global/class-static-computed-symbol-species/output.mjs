import "core-js/modules/es.symbol.species";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array-buffer.species";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.regexp.species";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.typed-array.species";
import "core-js/modules/web.dom-collections.iterator";
class C extends Map {
  static [Symbol.species]() {
    return Map;
  }
}