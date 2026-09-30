import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// An unknown write key may replace the constructor slot read by the nested pattern.
const dynamicWriteKey = function (key) {
  const dynamic = {
    k: Object
  };
  dynamic[key] = _Map;
  const {
      k: _ref
    } = dynamic,
    groupBy = _ref === Object ? _Object$groupBy : _ref.groupBy;
  return groupBy;
}('k');
export { dynamicWriteKey };