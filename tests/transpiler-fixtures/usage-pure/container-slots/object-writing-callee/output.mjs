import _entries from "@core-js/pure/actual/instance/entries";
import _Map from "@core-js/pure/actual/map";
import _Object$entries from "@core-js/pure/actual/object/entries";
// A local callee receives the container and writes its constructor slot before the nested read.
function poisonContainer(target) {
  target.k = _Map;
}
const closureWrite = function () {
  const closed = {
    k: Object
  };
  poisonContainer(closed);
  const {
      k: _ref
    } = closed,
    entries = _ref === Object ? _Object$entries : _entries(_ref);
  return entries;
}();
export { closureWrite };