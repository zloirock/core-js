import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A computed class key reads the enclosing function's supplied receiver.
// It must retain the supplied constructor's static methods.
function read() {
  return Object.keys(new class {
    [typeof this.groupBy] = 1;
  }())[0];
}
consume(Reflect.apply(read, Map, []));