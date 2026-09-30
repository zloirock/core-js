import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A for-of binding receives the container and writes its constructor slot before the nested read.
const escapedByForOfHead = function () {
  const loopBox = {
    k: Object
  };
  for (const x of [loopBox]) x.k = Map;
  const {
    k: {
      defineProperties
    }
  } = loopBox;
  return defineProperties;
}();
export { escapedByForOfHead };