import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A write through a definite alias replaces the original container's constructor slot.
const escapedByAlias = function () {
  const aliasedBox = {
    k: Object
  };
  const aliasName = aliasedBox;
  aliasName.k = Map;
  const {
    k: {
      getPrototypeOf
    }
  } = aliasedBox;
  return getPrototypeOf;
}();
export { escapedByAlias };