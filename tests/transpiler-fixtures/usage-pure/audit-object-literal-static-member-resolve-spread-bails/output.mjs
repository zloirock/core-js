import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A trailing spread may replace the slot; preserve the replacement's own property.
export function spreadBails(extra) {
  const ns = {
    Q: _Map,
    ...extra
  };
  const {
      Q: _ref
    } = ns,
    groupBy = _ref === _Map ? _Map$groupBy : _ref.groupBy;
  return groupBy([], x => x);
}