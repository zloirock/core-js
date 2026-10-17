import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/web.dom-collections.iterator";
export function redeclared() {
  var list = [3, 4];
  var {
    a: list = [1].entries()
  } = {
    a: undefined
  };
  return list.flatMap(x => [x]);
}