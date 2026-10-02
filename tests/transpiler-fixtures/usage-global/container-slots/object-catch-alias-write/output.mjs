import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A local catch alias writes the held constructor slot before it is read.
// The catch itself hands no constructor out; the written slot still contributes its own family.
const escapedByThrow = function () {
  const thrownBox = {
    k: Object
  };
  try {
    throw thrownBox;
  } catch (caught) {
    caught.k = Map;
  }
  const {
    k: {
      create: viaThrow
    }
  } = thrownBox;
  return viaThrow;
}();
export { escapedByThrow };