import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A computed method key reads the enclosing function's supplied receiver.
// The constructor therefore needs its namespace when passed through the invoker.
function read() {
  return Object.keys({
    [typeof this.groupBy]() {}
  })[0];
}
consume(read.call(Map));