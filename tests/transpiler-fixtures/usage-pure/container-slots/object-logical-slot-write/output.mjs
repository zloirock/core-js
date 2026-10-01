import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// A logical assignment can replace the constructor stored in the slot read by the pattern.
const assignedViaLogicalWrite = function () {
  const logical = {
    k: Object
  };
  logical.k &&= _Map;
  const {
      k: _ref
    } = logical,
    groupBy = _ref === Object ? _Object$groupBy : _ref.groupBy;
  return groupBy;
}();
export { assignedViaLogicalWrite };