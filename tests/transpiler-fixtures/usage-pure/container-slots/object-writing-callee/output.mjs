import _entries from "@core-js/pure/actual/instance/entries";
import _Map from "@core-js/pure/actual/map";
// A local callee receives the container and writes its constructor slot before the nested read.
function poisonContainer(target) {
  target.k = _Map;
}
const closureWrite = function () {
  const closed = {
    k: Object
  };
  poisonContainer(closed);
  const entries = _entries(closed.k);
  return entries;
}();
export { closureWrite };