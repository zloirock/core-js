import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An object pattern binds the contained object whose slot is subsequently replaced.
const escapedByObjectPatternInit = function () {
  const objPatBox = {
    k: Object
  };
  const {
    taken
  } = {
    taken: objPatBox
  };
  taken.k = Map;
  const {
    k: {
      fromEntries
    }
  } = objPatBox;
  return fromEntries;
}();
export { escapedByObjectPatternInit };