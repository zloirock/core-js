import _Map from "@core-js/pure/actual/map";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// Object.assign receives the container and may replace its constructor slot before the read.
const assignedViaObjectAssign = function () {
  const merged = {
    k: Object
  };
  _Object$assign(merged, {
    k: _Map
  });
  const {
      k: _ref
    } = merged,
    groupBy = _ref === Object ? _Object$groupBy : _ref.groupBy;
  return groupBy;
}();
export { assignedViaObjectAssign };