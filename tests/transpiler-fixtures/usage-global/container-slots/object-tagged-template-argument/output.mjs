import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A template interpolation hands the container to a tag that writes its constructor slot.
const escapedByTemplateTag = function () {
  function tagShape(strings, value) {
    if (value) value.k = Map;
    return '';
  }
  const tagBox = {
    k: Object
  };
  void tagShape`x${tagBox}`;
  const {
    k: {
      values
    }
  } = tagBox;
  return values;
}();
export { escapedByTemplateTag };