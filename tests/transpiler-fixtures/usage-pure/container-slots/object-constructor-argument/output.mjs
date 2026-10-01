import _entries from "@core-js/pure/actual/instance/entries";
import _Map from "@core-js/pure/actual/map";
import _Object$entries from "@core-js/pure/actual/object/entries";
// A new-expression argument hands the container to a constructor that writes its slot.
const escapedByNew = function () {
  function TakerShape(target) {
    if (target) target.k = _Map;
  }
  const newBox = {
    k: Object
  };
  void new TakerShape(newBox);
  const {
      k: _ref
    } = newBox,
    entries = _ref === Object ? _Object$entries : _entries(_ref);
  return entries;
}();
export { escapedByNew };