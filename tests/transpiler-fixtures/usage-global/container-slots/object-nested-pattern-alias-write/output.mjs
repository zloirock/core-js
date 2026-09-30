import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A nested literal pattern binds an alias that can replace the original constructor slot.
const escapedByNestedPatternLiteral = function () {
  const deepBox = {
    k: Object
  };
  const [{
    q: reBound
  }] = [{
    q: deepBox
  }];
  reBound.k = Map;
  const {
    k: {
      getOwnPropertyNames: deepRead
    }
  } = deepBox;
  return deepRead;
}();
export { escapedByNestedPatternLiteral };