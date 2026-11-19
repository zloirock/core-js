import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An array pattern binds the contained object whose slot is subsequently replaced.
const escapedByArrayPatternInit = function () {
  const patBox = {
    k: Object
  };
  const [reHomed] = [patBox];
  reHomed.k = Map;
  const {
    k: {
      getOwnPropertySymbols
    }
  } = patBox;
  return getOwnPropertySymbols;
}();
export { escapedByArrayPatternInit };