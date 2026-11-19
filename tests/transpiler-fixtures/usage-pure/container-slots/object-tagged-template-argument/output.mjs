import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map";
// A template interpolation hands the container to a tag that writes its constructor slot.
const escapedByTemplateTag = function () {
  function tagShape(strings, value) {
    if (value) value.k = _Map;
    return '';
  }
  const tagBox = {
    k: Object
  };
  void tagShape`x${tagBox}`;
  const values = _values(tagBox.k);
  return values;
}();
export { escapedByTemplateTag };