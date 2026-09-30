import _Map from "@core-js/pure/actual/map";
import _Object$entries from "@core-js/pure/actual/object/entries";
// A conditional slot write leaves both runtime constructor candidates possible at the read.
const conditionalSlotWrite = function (flag) {
  const maybe = {
    k: Object
  };
  if (flag) maybe.k = _Map;
  const {
      k: _ref
    } = maybe,
    entries = _ref === Object ? _Object$entries : _ref.entries;
  return entries;
}(1);
export { conditionalSlotWrite };