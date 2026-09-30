import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A write through an object wrapper reaches the original container's constructor slot.
const escapedByWrapperLiteral = function () {
  const wrappedBox = {
    k: Object
  };
  const wrapAround = {
    ref: wrappedBox
  };
  wrapAround.ref.k = Map;
  const {
    k: {
      create
    }
  } = wrappedBox;
  return create;
}();
export { escapedByWrapperLiteral };