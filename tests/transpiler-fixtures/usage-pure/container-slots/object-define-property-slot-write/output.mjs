import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// Object.defineProperty receives the container and replaces its constructor slot.
const assignedViaDefineProperty = function () {
  const defined = {
    k: Object
  };
  Object.defineProperty(defined, 'k', {
    value: _Map
  });
  const {
      k: _ref
    } = defined,
    groupBy = _ref === Object ? _Object$groupBy : _ref.groupBy;
  return groupBy;
}();
export { assignedViaDefineProperty };